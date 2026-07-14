interface Task {
  id: number;
  title: string;
  status: "pending" | "done";
  task_type_id: number;
  subject_id: number | null;
  priority: "baja" | "media" | "alta";
  due_date: string;
}

interface TaskType {
  id: number;
  name: string;
  base_points: number;
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

interface UpcomingTasksListProps {
  tasks: Task[];
  taskTypes: TaskType[];
  subjects: Subject[];
  onSelectTask: (dueDate: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  baja: "#51cf66",
  media: "#ffd43b",
  alta: "#ff6b6b",
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

function UpcomingTasksList({ tasks, taskTypes, subjects, onSelectTask }: UpcomingTasksListProps) {
  const pending = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  function typeName(id: number) {
    return taskTypes.find((t) => t.id === id)?.name ?? "";
  }
  function subjectName(id: number | null) {
    if (!id) return null;
    return subjects.find((s) => s.id === id)?.name ?? null;
  }

  return (
    <div style={{ flex: 1, minWidth: 220 }}>
      <h3 style={{ marginTop: 0 }}>Próximas tareas</h3>

      {pending.length === 0 && (
        <p style={{ opacity: 0.6, fontSize: 14 }}>No hay tareas pendientes.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {pending.map((task) => (
          <li
            key={task.id}
            onClick={() => onSelectTask(task.due_date)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "#16263d",
              border: "1px solid #2a4a6b",
              borderRadius: 8,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            <span
              title={`Prioridad ${task.priority}`}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: PRIORITY_COLORS[task.priority] ?? "#888",
                marginTop: 4,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{task.title}</div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                {typeName(task.task_type_id)}
                {subjectName(task.subject_id) && ` · ${subjectName(task.subject_id)}`}
                {` · ${formatDate(task.due_date)}`}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UpcomingTasksList;