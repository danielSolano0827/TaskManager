export function todayKey(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  return status === "pending" && dueDate < todayKey();
}