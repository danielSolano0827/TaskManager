import { getDb } from "./db";
import { notify } from "./notifications";
import { todayKey } from "./dateUtils";

const DAYS_BEFORE: Record<string, number> = {
  alta: 7,
  media: 5,
  baja: 3,
};

interface TaskForReminder {
  id: number;
  title: string;
  due_date: string;
  priority: "baja" | "media" | "alta";
  last_notified_date: string | null;
}

function daysUntil(dateStr: string): number {
  const today = new Date(todayKey() + "T00:00");
  const due = new Date(dateStr + "T00:00");
  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export async function checkAndNotifyPendingTasks(userId: number) {
  const db = await getDb();
  const tasks = await db.select<TaskForReminder[]>(
    "SELECT id, title, due_date, priority, last_notified_date FROM tasks WHERE user_id = $1 AND status = 'pending'",
    [userId]
  );

  const today = todayKey();

  for (const task of tasks) {
    if (task.last_notified_date === today) continue;

    const daysLeft = daysUntil(task.due_date);
    const threshold = DAYS_BEFORE[task.priority] ?? 3;

    if (daysLeft >= 0 && daysLeft <= threshold) {
      const dayLabel = daysLeft === 0 ? "hoy" : daysLeft === 1 ? "mañana" : `en ${daysLeft} días`;
      await notify(
        `📌 ${task.title}`,
        `Vence ${dayLabel} · Prioridad ${task.priority}`
      );

      await db.execute(
        "UPDATE tasks SET last_notified_date = $1 WHERE id = $2",
        [today, task.id]
      );
    }
  }
}