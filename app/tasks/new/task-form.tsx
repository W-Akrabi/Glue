'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createTask } from '@/lib/actions/tasks';
import Link from 'next/link';

type Props = {
  users: { id: string; name: string | null; email: string; role: string }[];
  records: { id: string; title: string; entityType: string }[];
  parentTasks: { id: string; title: string }[];
};

export default function TaskForm({ users, records, parentTasks }: Props) {
  const [state, formAction] = useActionState(createTask, {});

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="new-task-heading">Create Task</h2>
          <p className="text-sm text-gray-500">Create a new task, optionally linked to an approval record.</p>
        </div>
        <Link href="/tasks" className="text-sm text-[#6B7280] hover:text-[#1F2430]">
          Back to tasks
        </Link>
      </div>

      <Card className="border-[#E6E9F4] bg-white/90">
        <CardContent className="p-6">
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="What needs to be done?"
                data-testid="task-title-input"
                className="rounded-xl border-[#E6E9F4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add details, context, or acceptance criteria..."
                data-testid="task-description-input"
                className="rounded-xl border-[#E6E9F4] min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  data-testid="task-type-select"
                  className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white px-3 text-sm"
                  defaultValue="OTHER"
                >
                  <option value="IMPLEMENTATION">Implementation</option>
                  <option value="REVIEW">Review</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  data-testid="task-priority-select"
                  className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white px-3 text-sm"
                  defaultValue="MEDIUM"
                >
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <select
                  id="status"
                  name="status"
                  data-testid="task-status-select"
                  className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white px-3 text-sm"
                  defaultValue="BACKLOG"
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigneeId">Assignee</Label>
                <select
                  id="assigneeId"
                  name="assigneeId"
                  data-testid="task-assignee-select"
                  className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueAt">Due Date</Label>
                <Input
                  id="dueAt"
                  name="dueAt"
                  type="date"
                  data-testid="task-due-input"
                  className="rounded-xl border-[#E6E9F4]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimateHours">Estimate (hours)</Label>
                <Input
                  id="estimateHours"
                  name="estimateHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="e.g. 4"
                  data-testid="task-estimate-input"
                  className="rounded-xl border-[#E6E9F4]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordId">Link to Approval Record (optional)</Label>
              <select
                id="recordId"
                name="recordId"
                data-testid="task-record-select"
                className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white px-3 text-sm"
                defaultValue=""
              >
                <option value="">None (standalone task)</option>
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.entityType})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentTaskId">Parent Task (optional)</Label>
              <select
                id="parentTaskId"
                name="parentTaskId"
                data-testid="task-parent-select"
                className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white px-3 text-sm"
                defaultValue=""
              >
                <option value="">None (top-level task)</option>
                {parentTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {state?.error && (
              <p className="text-sm text-destructive" data-testid="task-form-error">{state.error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                data-testid="task-submit-btn"
                className="bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] text-white rounded-full shadow-[0_10px_24px_rgba(79,106,250,0.25)]"
              >
                Create Task
              </Button>
              <Link href="/tasks" className="text-sm text-[#6B7280] hover:text-[#1F2430]">
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
