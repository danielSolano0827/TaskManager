import { useState } from "react";
import { isOverdue } from "./dateUtils";

interface Task {
  id: number;
  title: string;
  emoji: string;
  status: "pending" | "done";
  task_type_id: number;
  subject_id: number | null;
  priority: "baja" | "media" | "alta";
  grade: number | null;
  points_earned: number;
  due_date: string;
}

interface TaskType {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  color: string;
  semester_id: number;
}

interface Semester {
  id: number;
  name: string;
}

interface AllTasksViewProps {
  tasks: Task[];
  taskTypes: TaskType[];
  subjects: Subject[];
  semesters: Semester[];
  onSelectTask: (task: Task) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  baja: "var(--success)",
  media: "var(--warning)",
  alta: "var(--danger)",
};

const STATUS_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "done", label: "Completadas" },
  { id: "overdue", label: "Vencidas" },
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function AllTasksView({ tasks, taskTypes, subjects, semesters, onSelectTask }: AllTasksViewProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  function typeName(id: number) {
    return taskTypes.find((t) => t.id === id)?.name ?? "";
  }

  const filtered = tasks.filter((t) => {
    if (statusFilter === "pending" && (t.status !== "pending" || isOverdue(t.due_date, t.status))) return false;
    if (statusFilter === "done" && t.status !== "done") return false;
    if (statusFilter === "overdue" && !isOverdue(t.due_date, t.status)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Materias sin semestre no deberían existir, pero por seguridad las agrupamos aparte
  const semesterGroups = semesters.map((sem) => {
    const subjectIds = subjects.filter((s) => s.semester_id === sem.id).map((s) => s.id);
    const semTasks = filtered.filter((t) => t.subject_id !== null && subjectIds.includes(t.subject_id));
    return { semester: sem, tasks: semTasks };
  }).filter((g) => g.tasks.length > 0);

  const noSubjectTasks = filtered.filter((t) => t.subject_id === null);

  function subjectFor(id: number | null) {
    if (!id) return null;
    return subjects.find((s) => s.id === id) ?? null;
  }

  function renderTaskRow(task: Task) {
    const overdue = isOverdue(task.due_date, task.status);
    const subj = subjectFor(task.subject_id);

    return (
      <li
        key={task.id}
        onClick={() => onSelectTask(task)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: overdue ? "var(--danger-tint)" : "var(--bg-surface)",
          border: `1px solid ${overdue ? "var(--danger)" : "var(--border)"}`,
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        <span
          style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLORS[task.priority] ?? "#888", flexShrink: 0 }}
        />
        <span style={{ fontSize: 16 }}>{task.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              fontSize: 14,
              textDecoration: task.status === "done" ? "line-through" : "none",
              opacity: task.status === "done" ? 0.6 : 1,
            }}
          >
            {task.title}
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            {typeName(task.task_type_id)}
            {subj && (
              <>
                {" · "}
                <span style={{ color: subj.color }}>{subj.name}</span>
              </>
            )}
            {" · "}{formatDate(task.due_date)}
            {task.status === "done" && ` · ${task.grade}% · +${task.points_earned} pts`}
            {overdue && " · Vencida"}
          </div>
        </div>
      </li>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Todas las tareas</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          style={{ padding: 8, flex: 1, minWidth: 180 }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                background: statusFilter === f.id ? "var(--accent)" : "var(--bg-surface)",
                color: statusFilter === f.id ? "white" : "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p style={{ opacity: 0.6, textAlign: "center", marginTop: 40 }}>
          No hay tareas que coincidan con este filtro.
        </p>
      )}

      {semesterGroups.map(({ semester, tasks: semTasks }) => {
        // Agrupar por materia dentro del semestre
        const subjectMap = new Map<number, Task[]>();
        for (const t of semTasks) {
          const sid = t.subject_id as number;
          if (!subjectMap.has(sid)) subjectMap.set(sid, []);
          subjectMap.get(sid)!.push(t);
        }

        return (
          <div key={semester.id} style={{ marginBottom: 28 }}>
            <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 14 }}>
              {semester.name}
            </h3>

            {Array.from(subjectMap.entries()).map(([subjectId, subjTasks]) => {
              const subj = subjectFor(subjectId);
              return (
                <div key={subjectId} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: subj?.color ?? "#888" }} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{subj?.name ?? "Materia"}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {subjTasks.map(renderTaskRow)}
                  </ul>
                </div>
              );
            })}
          </div>
        );
      })}

      {noSubjectTasks.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 14 }}>
            Sin materia
          </h3>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {noSubjectTasks.map(renderTaskRow)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AllTasksView;