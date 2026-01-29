# Architecture: Approval Flow

Below is a high-level diagram for how approvals flow through Glue. The sequence focuses on the lifecycle from record creation to approval, including comments, blockers, and SLA reminders.

```mermaid
flowchart TD
  A[Record created] --> B[Workflow instance created]
  B --> C[Step 1: Pending approval]
  C --> D{Assigned approver acts?}
  D -->|Approve| E[Step approved]
  D -->|Reject| F[Record rejected]
  E --> G{More steps?}
  G -->|Yes| H[Next step pending]
  G -->|No| I[Record approved]

  C --> J[Comment added]
  J --> K{Comment type}
  K -->|Comment/Question| L[Timeline update]
  K -->|Blocker| M[Blocker opened]
  M --> N{Resolved?}
  N -->|No| O[Approval blocked]
  N -->|Yes| L

  C --> P{SLA due?}
  P -->|Overdue| Q[Notify assignees/escalate]
  P -->|On time| D
```

Key rules:
- Approvals are only allowed for assigned approvers on the current step.
- Unresolved blocker comments prevent approval.
- SLA checks send notifications and optionally escalate assignees.
