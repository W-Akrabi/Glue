'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateTaskStatus } from '@/lib/actions/tasks';
import {
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  User,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  Link2,
} from 'lucide-react';

type SerializedTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  assignee: { id: string; name: string | null; email: string } | null;
  createdBy: { id: string; name: string | null; email: string };
  record: { id: string; title: string; entityType: string } | null;
  subtasks: { id: string; title: string; status: string }[];
  parentTask: { id: string; title: string } | null;
  blockedBy: { id: string; title: string; status: string }[];
  dueAt: string | null;
  estimateHours: number | null;
  completedAt: string | null;
  createdAt: string;
};

type Props = {
  tasks: SerializedTask[];
  users: { id: string; name: string | null; email: string; role: string }[];
  viewMode: string;
  currentUserId: string;
  organizationId: string;
  userRole: string;
};

const STATUS_COLUMNS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  BACKLOG: { label: 'Backlog', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Circle className="h-3 w-3" /> },
  TODO: { label: 'To Do', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Circle className="h-3 w-3" /> },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Loader2 className="h-3 w-3" /> },
  BLOCKED: { label: 'Blocked', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: <AlertTriangle className="h-3 w-3" /> },
  DONE: { label: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const TYPE_LABELS: Record<string, string> = {
  IMPLEMENTATION: 'Implementation',
  REVIEW: 'Review',
  DOCUMENTATION: 'Documentation',
  FOLLOW_UP: 'Follow-up',
  OTHER: 'Other',
};
type TaskStatus = (typeof STATUS_COLUMNS)[number];

function AISuggestionsPanel({ currentUserId, organizationId, userRole }: { currentUserId: string; organizationId: string; userRole: string }) {
  const [suggestions, setSuggestions] = useState<{
    prioritized_actions?: { action: string; reason: string; urgency: string }[];
    blocker_alerts?: { issue: string; suggestion: string }[];
    quick_wins?: { task: string; estimated_time: string }[];
    summary?: string;
  } | null>(null);
  const [assigning, setAssigning] = useState<{
    assignments?: { task_title: string; task_id: string; recommended_assignee: string; reason: string }[];
    workload_analysis?: { member: string; status: string; suggestion: string }[];
    alerts?: { type: string; message: string }[];
    summary?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'assignments'>('suggestions');

  const backendUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('localhost') ? 'http://localhost:8001' : window.location.origin)
    : '';

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai/task-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, organizationId }),
      });
      const data = await res.json();
      setSuggestions(data.data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setAssignLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai/assignment-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      setAssigning(data.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <Card className="border-[#E6E9F4] bg-gradient-to-br from-white to-[#f0f2ff] mb-6">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#4F6AFA]" />
          <h3 className="font-semibold text-[#1F2430]">AI Assistant</h3>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('suggestions')}
            data-testid="ai-my-focus-tab"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'suggestions'
                ? 'border-[#4F6AFA] text-[#4F6AFA] bg-[#4F6AFA]/10'
                : 'border-[#E6E9F4] text-[#6B7280]'
            }`}
          >
            My Focus
          </button>
          {userRole === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('assignments')}
              data-testid="ai-team-tab"
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'assignments'
                  ? 'border-[#4F6AFA] text-[#4F6AFA] bg-[#4F6AFA]/10'
                  : 'border-[#E6E9F4] text-[#6B7280]'
              }`}
            >
              Team Assignments
            </button>
          )}
        </div>

        {activeTab === 'suggestions' && (
          <div>
            {!suggestions ? (
              <Button
                onClick={fetchSuggestions}
                disabled={loading}
                data-testid="ai-suggest-btn"
                className="bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] text-white rounded-full text-sm"
                size="sm"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Analyzing...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-1" /> What should I work on?</>
                )}
              </Button>
            ) : (
              <div className="space-y-4" data-testid="ai-suggestions-result">
                {suggestions.summary && (
                  <p className="text-sm text-[#4F6AFA] font-medium bg-[#4F6AFA]/5 rounded-xl px-4 py-3">
                    {suggestions.summary}
                  </p>
                )}
                {suggestions.prioritized_actions && suggestions.prioritized_actions.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">Priority Actions</p>
                    <div className="space-y-2">
                      {suggestions.prioritized_actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-[#E6E9F4]">
                          <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                            a.urgency === 'high' ? 'bg-red-400' : a.urgency === 'medium' ? 'bg-amber-400' : 'bg-gray-400'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-[#1F2430]">{a.action}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">{a.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.quick_wins && suggestions.quick_wins.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">Quick Wins</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.quick_wins.map((q, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> {q.task} ({q.estimated_time})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => { setSuggestions(null); fetchSuggestions(); }}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                >
                  Refresh
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && userRole === 'ADMIN' && (
          <div>
            {!assigning ? (
              <Button
                onClick={fetchAssignments}
                disabled={assignLoading}
                data-testid="ai-assign-btn"
                className="bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] text-white rounded-full text-sm"
                size="sm"
              >
                {assignLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Analyzing team...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-1" /> Get assignment recommendations</>
                )}
              </Button>
            ) : (
              <div className="space-y-4" data-testid="ai-assignments-result">
                {assigning.summary && (
                  <p className="text-sm text-[#4F6AFA] font-medium bg-[#4F6AFA]/5 rounded-xl px-4 py-3">
                    {assigning.summary}
                  </p>
                )}
                {assigning.assignments && assigning.assignments.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">Recommended Assignments</p>
                    <div className="space-y-2">
                      {assigning.assignments.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-[#E6E9F4]">
                          <User className="h-4 w-4 text-[#4F6AFA] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[#1F2430]">
                              {a.task_title} <ArrowRight className="inline h-3 w-3 mx-1" /> {a.recommended_assignee}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-0.5">{a.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {assigning.workload_analysis && assigning.workload_analysis.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">Team Workload</p>
                    <div className="space-y-2">
                      {assigning.workload_analysis.map((w, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#E6E9F4]">
                          <span className={`h-2 w-2 rounded-full ${
                            w.status === 'overloaded' ? 'bg-red-400' : w.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#1F2430]">{w.member}</p>
                            <p className="text-xs text-[#6B7280]">{w.suggestion}</p>
                          </div>
                          <Badge className={`text-[10px] ${
                            w.status === 'overloaded' ? 'bg-red-50 text-red-600 border-red-200' :
                            w.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>{w.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => { setAssigning(null); fetchAssignments(); }}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                >
                  Refresh
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: SerializedTask;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task.id);
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      className={isDragging ? 'opacity-60' : ''}
      data-testid={`task-draggable-${task.id}`}
    >
      <Link href={`/tasks/${task.id}`} data-testid={`task-card-${task.id}`}>
        <div className="bg-white rounded-2xl border border-[#E6E9F4] p-4 hover:shadow-md transition cursor-pointer group">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium text-[#1F2430] line-clamp-2 group-hover:text-[#4F6AFA] transition">
              {task.title}
            </h4>
            <Badge className={`shrink-0 text-[10px] border ${priorityConf.color}`}>
              {priorityConf.label}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8A94A7]">
            <span className="rounded-full bg-[#F4F6FA] px-2 py-0.5">
              {TYPE_LABELS[task.type] || task.type}
            </span>
            {task.assignee && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {task.assignee.name || task.assignee.email}
              </span>
            )}
            {task.dueAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(task.dueAt).toLocaleDateString()}
              </span>
            )}
            {task.estimateHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {task.estimateHours}h
              </span>
            )}
            {task.record && (
              <span className="flex items-center gap-1 text-[#4F6AFA]">
                <Link2 className="h-3 w-3" /> {task.record.entityType}
              </span>
            )}
          </div>

          {task.subtasks.length > 0 && (
            <div className="mt-2 text-[11px] text-[#8A94A7]">
              {task.subtasks.filter((s) => s.status === 'DONE').length}/{task.subtasks.length}{' '}
              subtasks done
            </div>
          )}

          {task.blockedBy.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-rose-500">
              <AlertTriangle className="h-3 w-3" /> Blocked by {task.blockedBy.length} task(s)
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function TaskBoard({
  tasks,
  users: _users,
  viewMode,
  currentUserId,
  organizationId,
  userRole,
}: Props) {
  void _users;
  const [boardTasks, setBoardTasks] = useState(tasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropStatus, setActiveDropStatus] = useState<TaskStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isUpdatingStatus, startTransition] = useTransition();

  useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  const handleDropToStatus = (targetStatus: TaskStatus, taskIdFromDrop?: string) => {
    const taskId = taskIdFromDrop || draggedTaskId;
    setActiveDropStatus(null);
    setDraggedTaskId(null);
    if (!taskId) return;

    const previousTasks = boardTasks;
    const movedTask = previousTasks.find((task) => task.id === taskId);
    if (!movedTask || movedTask.status === targetStatus) {
      return;
    }

    setStatusError(null);
    setBoardTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status: targetStatus } : task))
    );

    startTransition(async () => {
      const result = await updateTaskStatus(taskId, targetStatus);
      if (result?.error) {
        setBoardTasks(previousTasks);
        setStatusError(result.error);
      }
    });
  };

  if (viewMode === 'board') {
    return (
      <div>
        <AISuggestionsPanel
          currentUserId={currentUserId}
          organizationId={organizationId}
          userRole={userRole}
        />
        {statusError && (
          <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {statusError}
          </p>
        )}
        {isUpdatingStatus && (
          <p className="mb-3 text-xs text-[#6B7280]">Saving task status...</p>
        )}
        <div className="grid grid-cols-5 gap-4" data-testid="task-board">
          {STATUS_COLUMNS.map((status) => {
            const conf = STATUS_CONFIG[status];
            const columnTasks = boardTasks.filter((t) => t.status === status);
            return (
              <div key={status} className="space-y-3" data-testid={`column-${status}`}>
                <div className="flex items-center gap-2 px-1">
                  {conf.icon}
                  <span className="text-sm font-semibold text-[#1F2430]">{conf.label}</span>
                  <span className="ml-auto rounded-full bg-[#F4F6FA] px-2 py-0.5 text-[11px] text-[#6B7280]">
                    {columnTasks.length}
                  </span>
                </div>
                <div
                  className={`space-y-3 min-h-[200px] rounded-2xl p-2 transition ${
                    activeDropStatus === status
                      ? 'border border-dashed border-[#4F6AFA]/40 bg-[#4F6AFA]/5'
                      : ''
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    if (draggedTaskId) {
                      setActiveDropStatus(status);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const taskId = event.dataTransfer.getData('text/plain');
                    handleDropToStatus(status, taskId || undefined);
                  }}
                >
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={(taskId) => {
                        setDraggedTaskId(taskId);
                        setStatusError(null);
                      }}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setActiveDropStatus(null);
                      }}
                      isDragging={draggedTaskId === task.id}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#E6E9F4] p-6 text-center text-xs text-[#8A94A7]">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <AISuggestionsPanel
        currentUserId={currentUserId}
        organizationId={organizationId}
        userRole={userRole}
      />
      <div className="bg-white/90 border border-[#E6E9F4] rounded-lg overflow-hidden" data-testid="task-list">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E6E9F4] text-left text-xs text-[#6B7280] uppercase tracking-wider">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Linked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E9F4]">
            {boardTasks.map((task) => {
              const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.BACKLOG;
              const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
              return (
                <tr key={task.id} className="hover:bg-[#F4F6FA] transition">
                  <td className="px-4 py-3">
                    <Link href={`/tasks/${task.id}`} className="font-medium text-[#1F2430] hover:text-[#4F6AFA]" data-testid={`task-row-${task.id}`}>
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="text-xs text-[#8A94A7] line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] border ${statusConf.color}`}>{statusConf.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] border ${priorityConf.color}`}>{priorityConf.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">
                    {TYPE_LABELS[task.type] || task.type}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">
                    {task.assignee ? (task.assignee.name || task.assignee.email) : <span className="text-[#8A94A7]">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">
                    {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {task.record ? (
                      <Link href={`/requests/${task.record.id}`} className="text-[#4F6AFA] hover:underline flex items-center gap-1">
                        <Link2 className="h-3 w-3" /> {task.record.entityType}
                      </Link>
                    ) : (
                      <span className="text-[#8A94A7]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {boardTasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#8A94A7]">
                  No tasks yet.{' '}
                  <Link href="/tasks/new" className="text-[#4F6AFA] hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
