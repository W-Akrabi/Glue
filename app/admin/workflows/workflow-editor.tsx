"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateWorkflow } from "@/lib/actions/workflows";
import { getWorkflowSteps } from "@/lib/records";

type StepItem = {
  clientId: string;
  role: string;
  approverIds: string[];
  slaHours: string;
  escalationUserIds: string[];
  autoEscalate: boolean;
};

type WorkflowEditorProps = {
  entityTypes: Array<{ id: string; name: string; steps: unknown }>;
  initialEntityTypeId?: string;
  users: Array<{ id: string; name: string | null; email: string; role: string; avatarUrl?: string | null }>;
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
        {
          clientId: `${initialType?.id ?? "entity"}-step-1`,
          role: "MEMBER",
          approverIds: [],
          slaHours: "",
          escalationUserIds: [],
          autoEscalate: false,
        },
      ];
    }
    return parsed.map((step) => ({
      clientId: `${initialType?.id ?? "entity"}-step-${step.step}`,
      role: step.role,
      approverIds: step.approverIds ?? [],
      slaHours: step.slaHours ? String(step.slaHours) : "",
      escalationUserIds: step.escalationUserIds ?? [],
      autoEscalate: Boolean(step.autoEscalate),
    }));
  });
  const [entityTypeId, setEntityTypeId] = useState(
    initialEntityTypeId || entityTypes[0]?.id || ""
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [approverMenus, setApproverMenus] = useState<Record<string, boolean>>({});
  const [escalationMenus, setEscalationMenus] = useState<Record<string, boolean>>({});

  const [state, formAction] = useActionState(updateWorkflow, {});
  const avatarPalette = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-indigo-500",
  ];

  const payload = useMemo(
    () =>
      JSON.stringify(
        steps.map((step, index) => ({
          step: index + 1,
          role: step.role,
          approverIds: step.approverIds,
          slaHours: step.slaHours ? Number(step.slaHours) : undefined,
          escalationUserIds: step.escalationUserIds,
          autoEscalate: step.autoEscalate,
        }))
      ),
    [steps]
  );

  const updateRole = (clientId: string, role: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.clientId === clientId
          ? { ...step, role, approverIds: [], escalationUserIds: [] }
          : step
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

  const updateSlaHours = (clientId: string, value: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.clientId === clientId ? { ...step, slaHours: value } : step))
    );
  };

  const toggleEscalationUser = (clientId: string, userId: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.clientId !== clientId) {
          return step;
        }
        const exists = step.escalationUserIds.includes(userId);
        return {
          ...step,
          escalationUserIds: exists
            ? step.escalationUserIds.filter((id) => id !== userId)
            : [...step.escalationUserIds, userId],
        };
      })
    );
  };

  const toggleAutoEscalate = (clientId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.clientId === clientId ? { ...step, autoEscalate: !step.autoEscalate } : step
      )
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        clientId: `${entityTypeId || "entity"}-step-${prev.length + 1}-${crypto.randomUUID()}`,
        role: "MEMBER",
        approverIds: [],
        slaHours: "",
        escalationUserIds: [],
        autoEscalate: false,
      },
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

  const getInitials = (name?: string | null, email?: string | null) => {
    const source = name?.trim() || email?.trim() || "";
    if (!source) return "U";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="steps" value={payload} />
      <input type="hidden" name="entityTypeId" value={entityTypeId} />

      <div className="space-y-2" data-tour="workflow-entity-type">
        <Label htmlFor="entity-type">Entity type</Label>
        <select
          id="entity-type"
          className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white/90 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={entityTypeId}
          onChange={(event) => {
            const nextId = event.target.value;
            setEntityTypeId(nextId);
            const nextType = entityTypes.find((type) => type.id === nextId);
            const parsed = getWorkflowSteps(nextType?.steps ?? []);
            setSteps(
              parsed.length === 0
                ? [
                    {
                      clientId: `${nextId}-step-1`,
                      role: "MEMBER",
                      approverIds: [],
                      slaHours: "",
                      escalationUserIds: [],
                      autoEscalate: false,
                    },
                  ]
                : parsed.map((step) => ({
                    clientId: `${nextId}-step-${step.step}`,
                    role: step.role,
                    approverIds: step.approverIds ?? [],
                    slaHours: step.slaHours ? String(step.slaHours) : "",
                    escalationUserIds: step.escalationUserIds ?? [],
                    autoEscalate: Boolean(step.autoEscalate),
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
          className={`border-[#E6E9F4] bg-white/80 transition ${
            draggingId === step.clientId ? "ring-2 ring-emerald-500/50" : ""
          }`}
          draggable
          onDragStart={() => handleDragStart(step.clientId)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(step.clientId)}
          {...(index === 0 ? { "data-tour": "workflow-step-card" } : {})}
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
                className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white/90 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={step.role}
                onChange={(event) => updateRole(step.clientId, event.target.value)}
                {...(index === 0 ? { "data-tour": "workflow-role" } : {})}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2" {...(index === 0 ? { "data-tour": "workflow-approvers" } : {})}>
              <Label>Assigned approvers</Label>
              {users.filter((user) => user.role === step.role).length === 0 ? (
                <p className="text-xs text-amber-600/80">
                  No users with role {step.role}. Add users or change the role.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  {/*
                    Keep color assignment stable based on the role user list order,
                    so the same person keeps the same color across renders.
                  */}
                  {step.approverIds
                    .map((id) => users.find((user) => user.id === id))
                    .filter(Boolean)
                    .map((user) => {
                      if (!user) return null;
                      const initials = getInitials(user.name, user.email);
                      const roleUsers = users.filter((candidate) => candidate.role === step.role);
                      const colorIndex = Math.max(
                        0,
                        roleUsers.findIndex((candidate) => candidate.id === user.id)
                      );
                      const color = avatarPalette[colorIndex % avatarPalette.length];
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleApprover(step.clientId, user.id)}
                          className={`relative flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold transition ${
                            step.approverIds.length === 1
                              ? `${color} text-white shadow-lg`
                              : `${color} text-white shadow-lg hover:scale-[1.02]`
                          }`}
                          title={user.name || user.email}
                          aria-pressed={true}
                        >
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={user.name || user.email || "User"}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </button>
                      );
                    })}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setApproverMenus((prev) => ({
                          ...prev,
                          [step.clientId]: !prev[step.clientId],
                        }))
                      }
                      disabled={
                        users.filter(
                          (user) => user.role === step.role && !step.approverIds.includes(user.id)
                        ).length === 0
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E6E9F4] bg-white text-[#1F2430] shadow disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Add approver"
                    >
                      +
                    </button>
                    {approverMenus[step.clientId] ? (
                      <div className="absolute left-0 top-12 z-10 w-48 rounded-2xl border border-[#E6E9F4] bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#8A94A7] px-2 py-1">
                          Add approver
                        </div>
                        <div className="max-h-48 overflow-auto">
                          {users.filter(
                            (user) =>
                              user.role === step.role && !step.approverIds.includes(user.id)
                          ).length === 0 ? (
                            <div className="px-2 py-2 text-xs text-[#8A94A7]">
                              No more approvers for this role.
                            </div>
                          ) : (
                            users
                              .filter(
                                (user) =>
                                  user.role === step.role && !step.approverIds.includes(user.id)
                              )
                              .map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => {
                                    toggleApprover(step.clientId, user.id);
                                    setApproverMenus((prev) => ({
                                      ...prev,
                                      [step.clientId]: false,
                                    }));
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-[#1F2430] hover:bg-[#F4F6FA]"
                                >
                                  <span className="relative h-6 w-6 overflow-hidden rounded-full bg-[#EEF1FA] text-[10px] font-semibold text-[#4F6AFA] flex items-center justify-center">
                                    {user.avatarUrl ? (
                                      <Image
                                        src={user.avatarUrl}
                                        alt={user.name || user.email || "User"}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      getInitials(user.name, user.email)
                                    )}
                                  </span>
                                  <span className="truncate">
                                    {user.name || user.email}
                                  </span>
                                </button>
                              ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
              {step.approverIds.length === 0 ? (
                <p className="text-xs text-rose-500">Select at least one approver.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`sla-${step.clientId}`}>SLA (hours)</Label>
              <input
                id={`sla-${step.clientId}`}
                type="number"
                min="1"
                inputMode="numeric"
                className="h-10 w-full rounded-xl border border-[#E6E9F4] bg-white/90 px-3 text-sm text-white"
                placeholder="e.g. 48"
                value={step.slaHours}
                onChange={(event) => updateSlaHours(step.clientId, event.target.value)}
                {...(index === 0 ? { "data-tour": "workflow-sla" } : {})}
              />
              <p className="text-xs text-gray-400">Leave empty to disable SLA tracking.</p>
            </div>

            <div className="space-y-2" {...(index === 0 ? { "data-tour": "workflow-escalation" } : {})}>
              <Label>Escalate to</Label>
              <div className="flex flex-wrap items-center gap-3">
                {step.escalationUserIds
                  .map((id) => users.find((user) => user.id === id))
                  .filter(Boolean)
                  .map((user, idx) => {
                    if (!user) return null;
                    const initials = getInitials(user.name, user.email);
                    const color = avatarPalette[(idx + 2) % avatarPalette.length];
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleEscalationUser(step.clientId, user.id)}
                        className={`relative flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold transition ${color} text-white shadow-lg`}
                        title={user.name || user.email}
                        aria-pressed={true}
                      >
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.name || user.email || "User"}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </button>
                    );
                  })}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setEscalationMenus((prev) => ({
                        ...prev,
                        [step.clientId]: !prev[step.clientId],
                      }))
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E6E9F4] bg-white text-[#1F2430] shadow"
                    aria-label="Add escalation user"
                  >
                    +
                  </button>
                  {escalationMenus[step.clientId] ? (
                    <div className="absolute left-0 top-12 z-10 w-52 rounded-2xl border border-[#E6E9F4] bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#8A94A7] px-2 py-1">
                        Escalate to
                      </div>
                      <div className="max-h-52 overflow-auto">
                        {users
                          .filter((user) => !step.escalationUserIds.includes(user.id))
                          .map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                toggleEscalationUser(step.clientId, user.id);
                                setEscalationMenus((prev) => ({
                                  ...prev,
                                  [step.clientId]: false,
                                }));
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-[#1F2430] hover:bg-[#F4F6FA]"
                            >
                              <span className="relative h-6 w-6 overflow-hidden rounded-full bg-[#EEF1FA] text-[10px] font-semibold text-[#4F6AFA] flex items-center justify-center">
                                {user.avatarUrl ? (
                                  <Image
                                    src={user.avatarUrl}
                                    alt={user.name || user.email || "User"}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  getInitials(user.name, user.email)
                                )}
                              </span>
                              <span className="truncate">
                                {user.name || user.email}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleAutoEscalate(step.clientId)}
                className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
                  step.autoEscalate
                    ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                    : "border-[#E6E9F4] bg-white/90 text-[#6B7280] hover:text-[#1F2430]"
                }`}
                {...(index === 0 ? { "data-tour": "workflow-auto-escalate" } : {})}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    step.autoEscalate ? "bg-[#22C55E]" : "bg-[#D5DBE8]"
                  }`}
                />
                Auto-escalate by adding escalation users as approvers.
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={addStep} data-tour="workflow-add-step">
          Add step
        </Button>
        <Button type="submit" data-tour="workflow-save">
          Save workflow
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p className="text-sm text-emerald-300">Workflow updated.</p>}
      </div>
    </form>
  );
}
