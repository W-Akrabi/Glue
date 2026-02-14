'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  Link2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  BACKLOG: { label: 'Backlog', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  TODO: { label: 'To Do', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  BLOCKED: { label: 'Blocked', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  DONE: { label: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
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

const STATUS_FLOW = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

type Props = {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    type: string;
    priority: string;
    assignee: { id: string; name: string | null; email: string; role: string } | null;
    createdBy: { id: string; name: string | null; email: string };
    record: { id: string; title: string; status: string; entityType: string } | null;
    subtasks: {
      id: string;
      title: string;
      status: string;
      assignee: { id: string; name: string | null; email: string } | null;
      dueAt: string | null;
    }[];
    parentTask: { id: string; title: string } | null;
    blockedBy: { id: string; title: string; status: string }[];
    blocking: { id: string; title: string; status: string }[];
    dueAt: string | null;
    estimateHours: number | null;
    completedAt: string | null;
    createdAt: string;
  };
  users: { id: string; name: string | null; email: string; role: string }[];
  currentUserId: string;
};

export default function TaskDetail({ task, users, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.BACKLOG;
  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateTaskStatus(task.id, newStatus);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    startTransition(async () => {
      await deleteTask(task.id);
      router.push('/tasks');
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <Link href="/tasks" className="hover:text-[#1F2430] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Tasks
        </Link>
        {task.parentTask && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/tasks/${task.parentTask.id}`} className="hover:text-[#1F2430]">
              {task.parentTask.title}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#1F2430]">{task.title}</span>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Task details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#E6E9F4] bg-white/90">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-[#1F2430]" data-testid="task-detail-title">{task.title}</h1>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`border ${statusConf.color}`} data-testid="task-detail-status">{statusConf.label}</Badge>
                  <Badge className={`border ${priorityConf.color}`} data-testid="task-detail-priority">{priorityConf.label}</Badge>
                </div>
              </div>

              {task.description && (
                <div className="prose prose-sm max-w-none text-[#4A5163] mb-6" data-testid="task-detail-description">
                  <p>{task.description}</p>
                </div>
              )}

              {/* Status transition buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#E6E9F4]">
                <span className="text-xs text-[#6B7280] mr-2">Move to:</span>
                {STATUS_FLOW.filter((s) => s !== task.status).map((s) => {
                  const conf = STATUS_CONFIG[s];
                  return (
                    <Button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={isPending}
                      variant="outline"
                      size="sm"
                      data-testid={`status-btn-${s}`}
                      className={`rounded-full text-xs border ${conf.color}`}
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      {conf.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <Card className="border-[#E6E9F4] bg-white/90">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#1F2430] mb-4">
                  Subtasks ({task.subtasks.filter((s) => s.status === 'DONE').length}/{task.subtasks.length})
                </h3>
                <div className="space-y-2">
                  {task.subtasks.map((sub) => {
                    const subConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.BACKLOG;
                    return (
                      <Link
                        key={sub.id}
                        href={`/tasks/${sub.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F6FA] transition"
                        data-testid={`subtask-${sub.id}`}
                      >
                        {sub.status === 'DONE' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-[#8A94A7]" />
                        )}
                        <span className={`flex-1 text-sm ${sub.status === 'DONE' ? 'line-through text-[#8A94A7]' : 'text-[#1F2430]'}`}>
                          {sub.title}
                        </span>
                        <Badge className={`text-[10px] border ${subConf.color}`}>{subConf.label}</Badge>
                        {sub.assignee && (
                          <span className="text-xs text-[#8A94A7]">{sub.assignee.name || sub.assignee.email}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dependencies */}
          {(task.blockedBy.length > 0 || task.blocking.length > 0) && (
            <Card className="border-[#E6E9F4] bg-white/90">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#1F2430] mb-4">Dependencies</h3>
                {task.blockedBy.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">Blocked by</p>
                    <div className="space-y-2">
                      {task.blockedBy.map((dep) => {
                        const depConf = STATUS_CONFIG[dep.status] || STATUS_CONFIG.BACKLOG;
                        return (
                          <Link
                            key={dep.id}
                            href={`/tasks/${dep.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition"
                          >
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            <span className="flex-1 text-sm text-[#1F2430]">{dep.title}</span>
                            <Badge className={`text-[10px] border ${depConf.color}`}>{depConf.label}</Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
                {task.blocking.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-2">Blocking</p>
                    <div className="space-y-2">
                      {task.blocking.map((dep) => {
                        const depConf = STATUS_CONFIG[dep.status] || STATUS_CONFIG.BACKLOG;
                        return (
                          <Link
                            key={dep.id}
                            href={`/tasks/${dep.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition"
                          >
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="flex-1 text-sm text-[#1F2430]">{dep.title}</span>
                            <Badge className={`text-[10px] border ${depConf.color}`}>{depConf.label}</Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right side: Metadata */}
        <div className="space-y-6">
          <Card className="border-[#E6E9F4] bg-white/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-[#1F2430]">Details</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Type</span>
                  <span className="text-[#1F2430]">{TYPE_LABELS[task.type] || task.type}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Assignee</span>
                  <span className="text-[#1F2430] flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee ? (task.assignee.name || task.assignee.email) : 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Created by</span>
                  <span className="text-[#1F2430]">{task.createdBy.name || task.createdBy.email}</span>
                </div>

                {task.dueAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Due date</span>
                    <span className="text-[#1F2430] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {task.estimateHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Estimate</span>
                    <span className="text-[#1F2430] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.estimateHours}h
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Created</span>
                  <span className="text-[#1F2430]">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>

                {task.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Completed</span>
                    <span className="text-emerald-600">{new Date(task.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Linked Approval */}
          {task.record && (
            <Card className="border-[#E6E9F4] bg-white/90">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#1F2430] mb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-[#4F6AFA]" /> Linked Approval
                </h3>
                <Link
                  href={`/requests/${task.record.id}`}
                  className="block p-3 rounded-xl bg-[#F4F6FA] hover:bg-[#EEF1FA] transition"
                  data-testid="linked-record"
                >
                  <p className="text-sm font-medium text-[#1F2430]">{task.record.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
                    <span>{task.record.entityType}</span>
                    <Badge className="text-[10px]">{task.record.status}</Badge>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="border-[#E6E9F4] bg-white/90">
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold text-[#1F2430]">Actions</h3>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="w-full rounded-full"
                data-testid="delete-task-btn"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete Task
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
