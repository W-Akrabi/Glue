import os
import json
import uuid
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import psycopg2
import psycopg2.extras
import httpx

from emergentintegrations.llm.chat import LlmChat, UserMessage

app = FastAPI(title="Glue AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
DATABASE_URL = os.environ.get("DATABASE_URL", "")
NEXTJS_URL = "http://localhost:3000"


def get_db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)


class AISuggestRequest(BaseModel):
    userId: str
    organizationId: str


class AIAssignRequest(BaseModel):
    organizationId: str
    taskId: Optional[str] = None


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Proxy all /api/auth/* requests to Next.js server
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_auth(request: Request, path: str):
    target_url = f"{NEXTJS_URL}/api/auth/{path}"
    query = str(request.url.query)
    if query:
        target_url += f"?{query}"

    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)

    body = await request.body()

    async with httpx.AsyncClient(follow_redirects=False, timeout=30.0) as client:
        resp = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
        )

    excluded_headers = {"transfer-encoding", "content-encoding"}
    response_headers = {
        k: v for k, v in resp.headers.multi_items()
        if k.lower() not in excluded_headers
    }

    from fastapi.responses import Response as FastAPIResponse
    return FastAPIResponse(
        content=resp.content,
        status_code=resp.status_code,
        headers=dict(response_headers),
        media_type=resp.headers.get("content-type"),
    )


@app.post("/api/ai/task-suggestions")
async def task_suggestions(req: AISuggestRequest):
    try:
        conn = get_db()
        cur = conn.cursor()

        # Get user info (Prisma uses camelCase column names)
        cur.execute('SELECT id, name, email, role FROM users WHERE id = %s', (req.userId,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get user's current tasks
        cur.execute('''
            SELECT t.id, t.title, t.description, t.status, t.type, t.priority, t."dueAt",
                   t."estimateHours", t."recordId"
            FROM tasks t
            WHERE t."assigneeId" = %s AND t."organizationId" = %s
            AND t.status NOT IN ('DONE')
            ORDER BY
                CASE t.priority
                    WHEN 'URGENT' THEN 1
                    WHEN 'HIGH' THEN 2
                    WHEN 'MEDIUM' THEN 3
                    WHEN 'LOW' THEN 4
                END,
                t."dueAt" ASC NULLS LAST
            LIMIT 20
        ''', (req.userId, req.organizationId))
        tasks = cur.fetchall()

        # Get tasks that are blocking user's tasks
        cur.execute('''
            SELECT td."blockedTaskId", bt.title as blocking_title, bt.status as blocking_status
            FROM task_dependencies td
            JOIN tasks bt ON bt.id = td."blockingTaskId"
            JOIN tasks t ON t.id = td."blockedTaskId"
            WHERE t."assigneeId" = %s AND bt.status != 'DONE'
        ''', (req.userId,))
        blockers = cur.fetchall()

        # Get pending approvals for user
        cur.execute('''
            SELECT r.id, r.data, r.status, et.name as entity_type
            FROM records r
            JOIN entity_types et ON et.id = r."entityTypeId"
            JOIN workflow_instances wi ON wi."recordId" = r.id
            JOIN workflow_step_instances wsi ON wsi."workflowInstanceId" = wi.id
                AND wsi."stepNumber" = wi."currentStep"
            WHERE r."organizationId" = %s
                AND r.status = 'PENDING_APPROVAL'
                AND wsi.status = 'PENDING'
                AND wsi."assignedApproverIds"::jsonb ? %s
            LIMIT 10
        ''', (req.organizationId, req.userId))
        pending_approvals = cur.fetchall()

        conn.close()

        # Build context for AI
        tasks_context = []
        for t in tasks:
            tasks_context.append({
                "title": t["title"],
                "status": str(t["status"]),
                "type": str(t["type"]),
                "priority": str(t["priority"]),
                "due": str(t["dueAt"]) if t["dueAt"] else "No deadline",
                "estimate": f"{t['estimateHours']}h" if t["estimateHours"] else "Unestimated"
            })

        blocker_context = []
        for b in blockers:
            blocker_context.append({
                "blocking_title": b["blocking_title"],
                "blocking_status": str(b["blocking_status"])
            })

        approval_context = []
        for a in pending_approvals:
            data = a["data"] if isinstance(a["data"], dict) else json.loads(a["data"]) if a["data"] else {}
            approval_context.append({
                "entity_type": a["entity_type"],
                "title": data.get("title", "Untitled"),
                "status": str(a["status"])
            })

        prompt = f"""You are an AI task management assistant for the Glue workflow platform. 
Analyze the following context for user "{user['name'] or user['email']}" (role: {user['role']}) and provide actionable task suggestions.

CURRENT TASKS ({len(tasks_context)}):
{json.dumps(tasks_context, indent=2)}

BLOCKERS ({len(blocker_context)}):
{json.dumps(blocker_context, indent=2)}

PENDING APPROVALS ({len(approval_context)}):
{json.dumps(approval_context, indent=2)}

Based on this context, provide:
1. A prioritized list of what this person should work on next (top 3-5 items)
2. Any blockers they should resolve or escalate
3. Quick wins they can complete to maintain momentum

Format your response as JSON:
{{
  "prioritized_actions": [
    {{"action": "...", "reason": "...", "urgency": "high|medium|low"}}
  ],
  "blocker_alerts": [
    {{"issue": "...", "suggestion": "..."}}
  ],
  "quick_wins": [
    {{"task": "...", "estimated_time": "..."}}
  ],
  "summary": "A brief 1-2 sentence summary of their workload status"
}}

Respond ONLY with valid JSON, no markdown.
"""

        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"task-suggest-{uuid.uuid4().hex[:8]}",
            system_message="You are a task management AI that returns structured JSON responses."
        )
        chat.with_model("openai", "gpt-4o-mini")

        response = await chat.send_message(UserMessage(text=prompt))

        try:
            result = json.loads(response)
        except json.JSONDecodeError:
            start = response.find("{")
            end = response.rfind("}") + 1
            if start >= 0 and end > start:
                result = json.loads(response[start:end])
            else:
                result = {
                    "prioritized_actions": [],
                    "blocker_alerts": [],
                    "quick_wins": [],
                    "summary": response
                }

        return {"data": result}

    except HTTPException:
        raise
    except Exception as e:
        print(f"AI suggestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/assignment-recommendations")
async def assignment_recommendations(req: AIAssignRequest):
    try:
        conn = get_db()
        cur = conn.cursor()

        # Get all org users
        cur.execute('''
            SELECT id, name, email, role FROM users
            WHERE "organizationId" = %s
            ORDER BY name
        ''', (req.organizationId,))
        users = cur.fetchall()

        # Get task counts per user
        cur.execute('''
            SELECT "assigneeId",
                   COUNT(*) FILTER (WHERE status NOT IN ('DONE')) as active_tasks,
                   COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
                   COUNT(*) FILTER (WHERE status = 'BLOCKED') as blocked,
                   COUNT(*) FILTER (WHERE priority = 'URGENT' AND status NOT IN ('DONE')) as urgent_tasks,
                   COUNT(*) FILTER (WHERE status = 'DONE') as completed_tasks
            FROM tasks
            WHERE "organizationId" = %s AND "assigneeId" IS NOT NULL
            GROUP BY "assigneeId"
        ''', (req.organizationId,))
        workload = {row["assigneeId"]: dict(row) for row in cur.fetchall()}

        # Get unassigned tasks
        cur.execute('''
            SELECT id, title, description, type, priority, "dueAt", "estimateHours", "recordId"
            FROM tasks
            WHERE "organizationId" = %s AND "assigneeId" IS NULL AND status NOT IN ('DONE')
            ORDER BY
                CASE priority
                    WHEN 'URGENT' THEN 1
                    WHEN 'HIGH' THEN 2
                    WHEN 'MEDIUM' THEN 3
                    WHEN 'LOW' THEN 4
                END,
                "dueAt" ASC NULLS LAST
            LIMIT 15
        ''', (req.organizationId,))
        unassigned = cur.fetchall()

        # If a specific task was requested, get its details
        target_task = None
        if req.taskId:
            cur.execute('''
                SELECT id, title, description, type, priority, "dueAt", "estimateHours", "recordId"
                FROM tasks WHERE id = %s
            ''', (req.taskId,))
            target_task = cur.fetchone()

        conn.close()

        # Build context
        team_context = []
        for u in users:
            wl = workload.get(u["id"], {})
            team_context.append({
                "name": u["name"] or u["email"],
                "role": u["role"],
                "active_tasks": wl.get("active_tasks", 0),
                "in_progress": wl.get("in_progress", 0),
                "blocked": wl.get("blocked", 0),
                "urgent_tasks": wl.get("urgent_tasks", 0),
                "completed_tasks": wl.get("completed_tasks", 0)
            })

        unassigned_context = []
        for t in unassigned:
            unassigned_context.append({
                "id": t["id"],
                "title": t["title"],
                "type": str(t["type"]),
                "priority": str(t["priority"]),
                "due": str(t["dueAt"]) if t["dueAt"] else "No deadline",
                "estimate": f"{t['estimateHours']}h" if t["estimateHours"] else "Unestimated",
                "linked_to_approval": bool(t["recordId"])
            })

        target_context = None
        if target_task:
            target_context = {
                "title": target_task["title"],
                "description": target_task["description"],
                "type": str(target_task["type"]),
                "priority": str(target_task["priority"])
            }

        prompt = f"""You are an AI admin assistant for the Glue workflow platform.
Analyze team workload and recommend task assignments.

TEAM MEMBERS ({len(team_context)}):
{json.dumps(team_context, indent=2)}

UNASSIGNED TASKS ({len(unassigned_context)}):
{json.dumps(unassigned_context, indent=2)}

{"SPECIFIC TASK TO ASSIGN: " + json.dumps(target_context, indent=2) if target_context else ""}

Based on this data, provide:
1. Assignment recommendations for unassigned tasks (match task type to role, balance workload)
2. Team workload analysis (who is overloaded, who has capacity)
3. Priority alerts (urgent unassigned tasks, bottlenecks)

Format your response as JSON:
{{
  "assignments": [
    {{"task_title": "...", "task_id": "...", "recommended_assignee": "...", "reason": "..."}}
  ],
  "workload_analysis": [
    {{"member": "...", "status": "overloaded|balanced|available", "suggestion": "..."}}
  ],
  "alerts": [
    {{"type": "urgent|bottleneck|deadline", "message": "..."}}
  ],
  "summary": "A brief overview of the team's task distribution"
}}

Respond ONLY with valid JSON, no markdown.
"""

        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"assign-rec-{uuid.uuid4().hex[:8]}",
            system_message="You are a team management AI that returns structured JSON responses."
        )
        chat.with_model("openai", "gpt-4o-mini")

        response = await chat.send_message(UserMessage(text=prompt))

        try:
            result = json.loads(response)
        except json.JSONDecodeError:
            start = response.find("{")
            end = response.rfind("}") + 1
            if start >= 0 and end > start:
                result = json.loads(response[start:end])
            else:
                result = {
                    "assignments": [],
                    "workload_analysis": [],
                    "alerts": [],
                    "summary": response
                }

        return {"data": result}

    except HTTPException:
        raise
    except Exception as e:
        print(f"AI assignment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
