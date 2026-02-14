# Glue Task Management Extension - PRD

## Original Problem Statement
Design an extension to Glue's approval workflow system that introduces native task management while reusing existing routing, assignment, and approval infrastructure. Tasks must feel like a first-class continuation of approvals, not a separate product. Added AI features: task suggestions for users and assignment recommendations for admins.

## Architecture
- **Frontend**: Next.js 16 (App Router) + TailwindCSS + Prisma ORM
- **Backend**: FastAPI (Python) on port 8001 for AI endpoints, proxying auth/requests API to Next.js
- **Database**: PostgreSQL with Prisma migrations
- **AI**: OpenAI gpt-4o-mini via Emergent LLM key for intelligent task suggestions and assignment recommendations
- **Auth**: NextAuth v5 with credentials provider

## User Personas
1. **Admin**: Can view team workload, get AI assignment recommendations, create/manage all tasks
2. **Member**: Can view their tasks, get AI suggestions on what to work on next, update task status

## Core Requirements
- [x] Task creation (standalone or linked to approval records)
- [x] Configurable task types (Implementation, Review, Documentation, Follow-up, Other)
- [x] Task status lifecycle: Backlog → Todo → In Progress → Blocked → Done
- [x] Priority levels: Urgent, High, Medium, Low
- [x] Assignment & dependencies (blocking/blocked-by)
- [x] Subtask support
- [x] Kanban board view per organization
- [x] Filterable list view
- [x] Tasks appear within approval dashboard (stats)
- [x] Bidirectional linkage between tasks and approvals
- [x] AI-powered task suggestions ("What should I work on?")
- [x] AI-powered assignment recommendations (for admins)

## What's Been Implemented (Feb 14, 2026)
1. **Prisma Schema Extension**: Task, TaskDependency models with relations to User, Organization, Record
2. **Server Actions**: createTask, updateTaskStatus, updateTask, deleteTask
3. **Pages**: /tasks (Kanban board + List view), /tasks/new (create form), /tasks/[id] (detail with status transitions)
4. **AI Backend**: FastAPI endpoints for task-suggestions and assignment-recommendations
5. **Auth Proxy**: /api/auth/* routes proxied from FastAPI to Next.js
6. **Dashboard Integration**: Task stats (Active Tasks, My Tasks) on main dashboard
7. **Navigation**: Tasks link in sidebar
8. **Seed Data**: 7 sample tasks with dependencies and subtasks

## Prioritized Backlog
### P0 (Critical)
- All core features implemented ✅

### P1 (High)
- Drag-and-drop Kanban board (move cards between columns)
- Task comments (reusing existing comment system)
- Workflow builder integration: auto-create tasks at specific workflow steps
- Task completion gating approval progression

### P2 (Medium)
- Task filtering by assignee, type, priority, date range
- SLA tracking for tasks
- Email notifications on task status changes
- Bulk task operations

### P3 (Low/Future)
- Task templates
- Time tracking on tasks
- Gantt chart view
- Task analytics dashboard

## Next Tasks
1. Add drag-and-drop to Kanban board
2. Integrate existing comment system into task detail page
3. Add task filtering capabilities
4. Add workflow builder step to auto-create tasks on approval success
