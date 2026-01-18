"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateWorkflow } from "@/lib/actions/workflows";

type StepItem = {
  clientId: string;
  requiredRole: string;
};

type WorkflowEditorProps = {
  initialSteps: Array<{ id: string; requiredRole: string }>;
};

const ROLE_OPTIONS = ["MEMBER", "APPROVER", "ADMIN"] as const;

export default function WorkflowEditor({ initialSteps }: WorkflowEditorProps) {
  const [steps, setSteps] = useState<StepItem[]>(
    initialSteps.length
      ? initialSteps.map((step) => ({
          clientId: step.id,
          requiredRole: step.requiredRole,
        }))
      : [{ clientId: crypto.randomUUID(), requiredRole: "APPROVER" }]
  );

  const [state, formAction] = useFormState(updateWorkflow, {});

  const payload = useMemo(
    () => JSON.stringify(steps.map((step) => ({ requiredRole: step.requiredRole }))),
    [steps]
  );

  const updateRole = (clientId: string, requiredRole: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.clientId === clientId ? { ...step, requiredRole } : step))
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { clientId: crypto.randomUUID(), requiredRole: "APPROVER" },
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

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="steps" value={payload} />

      {steps.map((step, index) => (
        <Card key={step.clientId} className="border-white/10 bg-black/40">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Step {index + 1}</p>
                <p className="text-base font-medium">Approval role</p>
              </div>
              <div className="flex items-center gap-2">
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
                value={step.requiredRole}
                onChange={(event) => updateRole(step.clientId, event.target.value)}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
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
