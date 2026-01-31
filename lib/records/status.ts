export const RECORD_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const;

export type RecordStatus = (typeof RECORD_STATUSES)[number];

const STATUS_ALIASES: Record<string, RecordStatus> = {
  PENDING: 'PENDING_APPROVAL',
};

const STATUS_LABELS: Record<RecordStatus, string> = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const STATUS_BADGE_CLASSES: Record<RecordStatus, string> = {
  DRAFT: 'status-badge status-badge--draft',
  PENDING_APPROVAL: 'status-badge status-badge--pending',
  APPROVED: 'status-badge status-badge--approved',
  REJECTED: 'status-badge status-badge--rejected',
};

export function normalizeRecordStatus(status: string): RecordStatus | undefined {
  const normalized = STATUS_ALIASES[status] ?? status;
  return RECORD_STATUSES.includes(normalized as RecordStatus)
    ? (normalized as RecordStatus)
    : undefined;
}

export function isPendingApprovalStatus(status: string): boolean {
  return normalizeRecordStatus(status) === 'PENDING_APPROVAL';
}

export function getRecordStatusLabel(status: string): string {
  const normalized = normalizeRecordStatus(status);
  return normalized ? STATUS_LABELS[normalized] : status;
}

export function getRecordStatusBadgeClasses(status: string): string {
  const normalized = normalizeRecordStatus(status);
  return normalized ? STATUS_BADGE_CLASSES[normalized] : STATUS_BADGE_CLASSES.DRAFT;
}

export function getNextActionLabel(status: string, waitingOn?: string): string {
  const normalized = normalizeRecordStatus(status);
  if (!normalized) {
    return 'Status unknown';
  }
  if (normalized === 'PENDING_APPROVAL') {
    return waitingOn ? `Waiting on ${waitingOn}` : 'Waiting on approval';
  }
  if (normalized === 'DRAFT') {
    return 'Draft';
  }
  return 'No further action';
}
