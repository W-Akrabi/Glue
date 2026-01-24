"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateWorkflow } from "@/lib/actions/workflows";
import { getWorkflowSteps } from "@/lib/records";

type StepItem = {
  clientId: string;
  role: string;
  approverIds: string[];
};

type WorkflowEditorProps = {
  entityTypes: Array<{ id: string; name: string; steps: unknown }>;
  initialEntityTypeId?: string;
  users: Array<{ id: string; name: string | null; email: string; role: string }>;
};

const ROLE_OPTIONS = ["MEMBER", "ADMIN"] as const;

export default function WorkflowEditor({
  entityTypes,
  initialEntityTypeId,
  users,
}: WorkflowEditorProps) {
  const [steps, setSteps] = useState<StepItem[]>(() => {
    const initialType =
      entityTypes.find((type) => type.id === initialEntityTypeId) ?? entityTypes[0];
    const parsed = getWorkflowSteps(initialType?.steps ?? []);
    if (parsed.length === 0) {
      return [
        { clientId: crypto.randomUUID(), role: "MEMBER", approverIds: [] },
      ];
    }
    return parsed.map((step) => ({
      clientId: crypto.randomUUID(),
      role: step.role,
      approverIds: step.approverIds ?? [],
    }));
  });
  const [entityTypeId, setEntityTypeId] = useState(
    initialEntityTypeId || entityTypes[0]?.id || ""
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [state, formAction] = useActionState(updateWorkflow, {});

  const payload = useMemo(
    () =>
      JSON.stringify(
        steps.map((step, index) => ({
          step: index + 1,
          role: step.role,
          approverIds: step.approverIds,
        }))
      ),
    [steps]
  );

  const updateRole = (clientId: string, role: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.clientId === clientId ? { ...step, role, approverIds: [] } : step
      )
    );
  };

  const toggleApprover = (clientId: string, userId: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.clientId !== clientId) {
          return step;
        }
        const exists = step.approverIds.includes(userId);
        return {
          ...step,
          approverIds: exists
            ? step.approverIds.filter((id) => id !== userId)
            : [...step.approverIds, userId],
        };
      })
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { clientId: crypto.randomUUID(), role: "MEMBER", approverIds: [] },
    ]);
  };

  const removeStep = (clientId: string) => {
    setSteps((prev) => prev.filter((step) => step.clientId !== clientId));
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handleDragStart = (clientId: string) => {
    setDraggingId(clientId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    const fromIndex = steps.findIndex((step) => step.clientId === draggingId);
    const toIndex = steps.findIndex((step) => step.clientId === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null);
      return;
    }
    moveStep(fromIndex, toIndex);
    setDraggingId(null);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="steps" value={payload} />
      <input type="hidden" name="entityTypeId" value={entityTypeId} />

      <div className="space-y-2">
        <Label htmlFor="entity-type">Entity type</Label>
        <select
          id="entity-type"
          className="h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={entityTypeId}
          onChange={(event) => {
            const nextId = event.target.value;
            setEntityTypeId(nextId);
            const nextType = entityTypes.find((type) => type.id === nextId);
            const parsed = getWorkflowSteps(nextType?.steps ?? []);
            setSteps(
              parsed.length === 0
                ? [{ clientId: crypto.randomUUID(), role: "MEMBER", approverIds: [] }]
                : parsed.map((step) => ({
                    clientId: crypto.randomUUID(),
                    role: step.role,
                    approverIds: step.approverIds ?? [],
                  }))
            );
          }}
        >
          {entityTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {steps.map((step, index) => (
        <Card
          key={step.clientId}
          className={`border-white/10 bg-black/40 transition ${
            draggingId === step.clientId ? "ring-2 ring-emerald-500/50" : ""
          }`}
          draggable
          onDragStart={() => handleDragStart(step.clientId)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(step.clientId)}
        >
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Step {index + 1}</p>
                <p className="text-base font-medium">Approval role</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 cursor-grab select-none">Drag</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveStep(index, index - 1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={index === steps.length - 1}
                  onClick={() => moveStep(index, index + 1)}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={steps.length === 1}
                  onClick={() => removeStep(step.clientId)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`role-${step.clientId}`}>Required role</Label>
              <select
                id={`role-${step.clientId}`}
                className="h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={step.role}
                onChange={(event) => updateRole(step.clientId, event.target.value)}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Assigned approvers</Label>
              {users.filter((user) => user.role === step.role).length === 0 ? (
                <p className="text-xs text-amber-200/80">
                  No users with role {step.role}. Add users or change the role.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {users
                    .filter((user) => user.role === step.role)
                    .map((user) => {
                    const isChecked = step.approverIds.includes(user.id);
                    return (
                      <label
                        key={user.id}
                      className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleApprover(step.clientId, user.id)}
                        className="h-4 w-4 rounded border-white/20 bg-black text-emerald-400"
                      />
                      <span className="flex-1">
                        {user.name || user.email}{" "}
                        <span className="text-gray-400">({user.role})</span>
                      </span>
                    </label>
                    );
                  })}
                </div>
              )}
              {step.approverIds.length === 0 ? (
                <p className="text-xs text-rose-200">Select at least one approver.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={addStep}>
          Add step
        </Button>
        <Button type="submit">Save workflow</Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p className="text-sm text-emerald-300">Workflow updated.</p>}
      </div>
    </form>
  );
}
