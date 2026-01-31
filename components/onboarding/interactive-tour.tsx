"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TourStep = {
  id: string;
  title: string;
  body: string;
  selector: string;
  roles?: string[];
};

type TourGroup =
  | "dashboard"
  | "requests"
  | "request-new"
  | "request-detail"
  | "org"
  | "admin-entity"
  | "admin-workflows";

const STORAGE_PREFIX = "glue:onboarding:v1";
const TOUR_EVENT = "glue-tour-start";

const stepsByGroup: Record<TourGroup, TourStep[]> = {
  dashboard: [
    {
      id: "nav-dashboard",
      title: "Dashboard",
      body: "Your home base for approval activity and quick navigation.",
      selector: '[data-tour="nav-dashboard"]',
    },
    {
      id: "dashboard-kpis",
      title: "Approval snapshot",
      body: "Track pending, approved, and rejected counts at a glance.",
      selector: '[data-tour="dashboard-kpis"]',
    },
    {
      id: "dashboard-records",
      title: "Recent records",
      body: "Open a record to review its details or take action.",
      selector: '[data-tour="dashboard-records"]',
    },
    {
      id: "header-search",
      title: "Global search",
      body: "Find records, people, and entities from anywhere.",
      selector: '[data-tour="header-search"]',
    },
    {
      id: "header-create",
      title: "Create a record",
      body: "Start a new approval workflow from here.",
      selector: '[data-tour="header-create"]',
      roles: ["MEMBER", "ADMIN"],
    },
    {
      id: "nav-records",
      title: "Records list",
      body: "Dive into everything that needs your review or was created by you.",
      selector: '[data-tour="nav-records"]',
    },
    {
      id: "nav-org",
      title: "Organization",
      body: "See team activity and billing details for your org.",
      selector: '[data-tour="nav-org"]',
    },
    {
      id: "nav-entity-types",
      title: "Entity types (Admin)",
      body: "Admins define the record types the team can create.",
      selector: '[data-tour="nav-entity-types"]',
      roles: ["ADMIN"],
    },
    {
      id: "nav-workflows",
      title: "Workflows (Admin)",
      body: "Admins configure approval steps and SLAs here.",
      selector: '[data-tour="nav-workflows"]',
      roles: ["ADMIN"],
    },
  ],
  requests: [
    {
      id: "nav-records",
      title: "Records",
      body: "Every request and approval lives here.",
      selector: '[data-tour="nav-records"]',
    },
    {
      id: "requests-create",
      title: "Create a record",
      body: "Start a new approval request from this button.",
      selector: '[data-tour="requests-create"]',
    },
    {
      id: "requests-filters",
      title: "Filters",
      body: "Slice records by status, entity type, or who needs to act.",
      selector: '[data-tour="requests-filters"]',
    },
    {
      id: "requests-table",
      title: "Record list",
      body: "Open a record to review or approve it.",
      selector: '[data-tour="requests-table"]',
    },
  ],
  "request-new": [
    {
      id: "nav-new-record",
      title: "New record",
      body: "Choose a record type and fill in the request details.",
      selector: '[data-tour="nav-new-record"]',
    },
    {
      id: "record-type",
      title: "Record type",
      body: "Pick the workflow you need (policy, purchase, vendor, etc.).",
      selector: '[data-tour="record-type"]',
    },
    {
      id: "record-form",
      title: "Record details",
      body: "Provide the info approvers need to make a decision.",
      selector: '[data-tour="record-form"]',
    },
    {
      id: "workflow-preview",
      title: "Approval path",
      body: "See who will be asked to approve and in what order.",
      selector: '[data-tour="workflow-preview"]',
    },
    {
      id: "record-submit",
      title: "Submit for approval",
      body: "Send the record into the workflow when you're ready.",
      selector: '[data-tour="record-submit"]',
    },
  ],
  "request-detail": [
    {
      id: "approval-actions",
      title: "Approve or reject",
      body: "If you're assigned, approve or reject with a comment here.",
      selector: '[data-tour="approval-actions"]',
    },
  ],
  org: [
    {
      id: "org-team",
      title: "Team directory",
      body: "See who is in the org and how much they're submitting.",
      selector: '[data-tour="org-team"]',
    },
    {
      id: "org-activity",
      title: "Recent activity",
      body: "Review recent approvals and record creation events.",
      selector: '[data-tour="org-activity"]',
    },
    {
      id: "org-billing",
      title: "Billing & plan",
      body: "Track plan status and manage billing controls.",
      selector: '[data-tour="org-billing"]',
      roles: ["ADMIN"],
    },
  ],
  "admin-entity": [
    {
      id: "nav-entity-types",
      title: "Entity types",
      body: "Define the record types your org can request.",
      selector: '[data-tour="nav-entity-types"]',
      roles: ["ADMIN"],
    },
    {
      id: "admin-entity-create",
      title: "Create entity types",
      body: "Add a schema so teams can submit structured requests.",
      selector: '[data-tour="admin-entity-create"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-name",
      title: "Entity type name",
      body: "Give this record type a clear, human-friendly name.",
      selector: '[data-tour="entity-name"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-title-field",
      title: "Title field",
      body: "Pick the field that will show as the record title in lists.",
      selector: '[data-tour="entity-title-field"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-description-field",
      title: "Description field",
      body: "Choose the field used as the record summary.",
      selector: '[data-tour="entity-description-field"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-create-permissions",
      title: "Create permissions",
      body: "Decide which roles can create this record type.",
      selector: '[data-tour="entity-create-permissions"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-fields-list",
      title: "Fields list",
      body: "Define the data you require in each record.",
      selector: '[data-tour="entity-fields-list"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-field-key",
      title: "Field key",
      body: "The internal ID used in forms and automation (e.g., vendorName).",
      selector: '[data-tour="entity-field-key"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-field-label",
      title: "Field label",
      body: "The friendly label shown to users filling the form.",
      selector: '[data-tour="entity-field-label"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-field-type",
      title: "Field type",
      body: "Choose text, select, number, date, etc.",
      selector: '[data-tour="entity-field-type"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-field-required",
      title: "Required",
      body: "Mark fields that must be completed before submission.",
      selector: '[data-tour="entity-field-required"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-field-placeholder",
      title: "Placeholder",
      body: "Optional hint text to guide the requester.",
      selector: '[data-tour="entity-field-placeholder"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-field-options",
      title: "Select options",
      body: "If you choose Select, list allowed values separated by commas.",
      selector: '[data-tour="entity-field-options"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-add-field",
      title: "Add field",
      body: "Add additional fields to capture everything you need.",
      selector: '[data-tour="entity-add-field"]',
      roles: ["ADMIN"],
    },
    {
      id: "entity-submit",
      title: "Create entity type",
      body: "Save the entity schema so it appears in record creation.",
      selector: '[data-tour="entity-submit"]',
      roles: ["ADMIN"],
    },
    {
      id: "admin-entity-list",
      title: "Existing types",
      body: "Edit workflows tied to each entity type.",
      selector: '[data-tour="admin-entity-list"]',
      roles: ["ADMIN"],
    },
  ],
  "admin-workflows": [
    {
      id: "nav-workflows",
      title: "Workflows",
      body: "Build approval steps and set SLAs here.",
      selector: '[data-tour="nav-workflows"]',
      roles: ["ADMIN"],
    },
    {
      id: "admin-workflow-editor",
      title: "Workflow editor",
      body: "Assign approvers and sequence every step.",
      selector: '[data-tour="admin-workflow-editor"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-entity-type",
      title: "Entity type",
      body: "Pick the entity type whose workflow you're editing.",
      selector: '[data-tour="workflow-entity-type"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-step-card",
      title: "Workflow step",
      body: "Each step represents a required approval stage.",
      selector: '[data-tour="workflow-step-card"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-role",
      title: "Required role",
      body: "Only users with this role can approve this step.",
      selector: '[data-tour="workflow-role"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-approvers",
      title: "Assigned approvers",
      body: "Choose which users with the required role can approve.",
      selector: '[data-tour="workflow-approvers"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-sla",
      title: "SLA (hours)",
      body: "Set how long approvers have before the step is overdue.",
      selector: '[data-tour="workflow-sla"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-escalation",
      title: "Escalations",
      body: "Pick who gets pulled in if the step stalls.",
      selector: '[data-tour="workflow-escalation"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-auto-escalate",
      title: "Auto-escalate",
      body: "Automatically add escalation users as approvers when overdue.",
      selector: '[data-tour="workflow-auto-escalate"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-add-step",
      title: "Add step",
      body: "Create another approval stage in the workflow.",
      selector: '[data-tour="workflow-add-step"]',
      roles: ["ADMIN"],
    },
    {
      id: "workflow-save",
      title: "Save workflow",
      body: "Apply your changes so new records follow this flow.",
      selector: '[data-tour="workflow-save"]',
      roles: ["ADMIN"],
    },
    {
      id: "admin-workflow-sla",
      title: "SLA runner",
      body: "Trigger SLA reminders and escalations on demand.",
      selector: '[data-tour="admin-workflow-sla"]',
      roles: ["ADMIN"],
    },
  ],
};

function getGroup(pathname: string): TourGroup | null {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/requests") return "requests";
  if (pathname === "/requests/new") return "request-new";
  if (pathname.startsWith("/requests/")) return "request-detail";
  if (pathname === "/org-select") return "org";
  if (pathname === "/admin/entity-types") return "admin-entity";
  if (pathname === "/admin/workflows") return "admin-workflows";
  return null;
}

function matchesRole(step: TourStep, role: string) {
  if (!step.roles || step.roles.length === 0) return true;
  return step.roles.includes(role);
}

export default function InteractiveTour({ role }: { role: string }) {
  const pathname = usePathname();
  const group = useMemo(() => getGroup(pathname), [pathname]);
  const steps = useMemo(() => {
    if (!group) return [] as TourStep[];
    return stepsByGroup[group].filter((step) => matchesRole(step, role));
  }, [group, role]);

  const storageKey = group ? `${STORAGE_PREFIX}:${group}:${role}` : "";
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const step = steps[stepIndex];

  const completeTour = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, "done");
    }
    setIsOpen(false);
  };

  const startTour = (force = false) => {
    if (!group || steps.length === 0) return;
    if (force && storageKey) {
      localStorage.removeItem(storageKey);
    }
    setStepIndex(0);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!group || steps.length === 0) {
      setIsOpen(false);
      return;
    }
    const isCompleted = storageKey ? localStorage.getItem(storageKey) === "done" : true;
    if (!isCompleted) {
      setStepIndex(0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [group, steps.length, storageKey]);

  useEffect(() => {
    if (!group || steps.length === 0) return;
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ force?: boolean }>;
      startTour(Boolean(customEvent.detail?.force));
    };
    window.addEventListener(TOUR_EVENT, handler);
    return () => window.removeEventListener(TOUR_EVENT, handler);
  }, [group, steps.length]);

  useEffect(() => {
    if (!isOpen || !step) {
      setTargetRect(null);
      return;
    }

    const target = document.querySelector(step.selector) as HTMLElement | null;
    if (!target) {
      let nextIndex = stepIndex + 1;
      while (nextIndex < steps.length) {
        const candidate = steps[nextIndex];
        if (document.querySelector(candidate.selector)) {
          setStepIndex(nextIndex);
          return;
        }
        nextIndex += 1;
      }
      completeTour();
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    const updateRect = () => {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, step, stepIndex, steps]);

  const highlightStyle = useMemo(() => {
    if (!targetRect) return undefined;
    const padding = 8;
    return {
      top: Math.max(targetRect.top - padding, 8),
      left: Math.max(targetRect.left - padding, 8),
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    } as CSSProperties;
  }, [targetRect]);

  const tooltipStyle = useMemo(() => {
    if (!targetRect) return undefined;
    const padding = 16;
    const tooltipWidth = 340;
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 180;
    let top = targetRect.bottom + 12;
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = targetRect.top - tooltipHeight - 12;
    }
    let left = targetRect.left;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (left < padding) left = padding;
    if (top < padding) top = padding;
    return {
      top: Math.round(top),
      left: Math.round(left),
      width: tooltipWidth,
    } as CSSProperties;
  }, [targetRect, stepIndex]);

  if (!isOpen || !step || !targetRect) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="absolute rounded-xl border border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
        style={highlightStyle}
      />
      <div
        ref={tooltipRef}
        className={cn(
          "absolute rounded-xl border border-white/10 bg-[#141821] p-4 text-white shadow-xl",
          "backdrop-blur"
        )}
        style={tooltipStyle}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <Button size="sm" variant="ghost" onClick={completeTour}>
            Skip
          </Button>
        </div>
        <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
        <p className="mt-2 text-sm text-gray-300">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
            disabled={stepIndex === 0}
          >
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (stepIndex >= steps.length - 1) {
                completeTour();
              } else {
                setStepIndex(stepIndex + 1);
              }
            }}
          >
            {stepIndex >= steps.length - 1 ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
