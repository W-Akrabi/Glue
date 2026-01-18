"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRecord } from "@/lib/actions/records";
import { getEntitySchema, getWorkflowSteps } from "@/lib/records";

type EntityTypePayload = {
  id: string;
  name: string;
  schema: unknown;
  workflowSteps: unknown;
};

type RecordFormProps = {
  entityTypes: EntityTypePayload[];
};

export default function RecordForm({ entityTypes }: RecordFormProps) {
  const [selectedId, setSelectedId] = useState(entityTypes[0]?.id || "");

  const selectedType = useMemo(
    () => entityTypes.find((type) => type.id === selectedId),
    [entityTypes, selectedId]
  );

  const schema = getEntitySchema(selectedType?.schema);
  const steps = getWorkflowSteps(selectedType?.workflowSteps ?? []);
  const hasWorkflow = steps.length > 0;

  return (
    <form action={createRecord} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="entity-type">Record type</Label>
        <select
          id="entity-type"
          name="entityTypeId"
          className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          required
        >
          {entityTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {schema.fields.map((field) => {
        const commonProps = {
          id: field.key,
          name: field.key,
          required: field.required,
          placeholder: field.placeholder || "",
        };

        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label} {field.required ? <span className="text-rose-400">*</span> : null}
            </Label>
            {field.type === "textarea" ? (
              <Textarea rows={6} {...commonProps} />
            ) : field.type === "select" ? (
              <select
                {...commonProps}
                className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select…</option>
                {(field.options || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <Input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} {...commonProps} />
            )}
          </div>
        );
      })}

      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="text-sm text-emerald-200 font-medium mb-2">Approval Workflow:</p>
        {steps.length === 0 ? (
          <p className="text-sm text-emerald-200/80">No workflow steps configured.</p>
        ) : (
          <ol className="text-sm text-emerald-200/80 space-y-1 ml-4 list-decimal">
            {steps.map((step) => (
              <li key={step.step}>
                Step {step.step}: {step.role} approval
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1"
          data-testid="submit-request-button"
          disabled={!hasWorkflow}
        >
          Submit Record
        </Button>
        <Button variant="secondary" asChild className="flex-1" data-testid="cancel-button">
          <a href="/requests">Cancel</a>
        </Button>
      </div>
    </form>
  );
}
