export function getOverdueLabel(dueAt?: Date | string | null) {
  if (!dueAt) {
    return null;
  }
  const dueDate = dueAt instanceof Date ? dueAt : new Date(dueAt);
  const diffMs = Date.now() - dueDate.getTime();
  if (diffMs <= 0) {
    return null;
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `Approval overdue by ${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `Approval overdue by ${days}d`;
}
