import { useState, FormEvent } from "react";

interface Task {
  id: number;
  title: string;
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
  base_points: number;
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

interface TaskModalProps {
  date: string;
  tasks: Task[];
  taskTypes: TaskType[];
  subjects: Subject[];
  onClose: () => void;
  onAddTask: (title: string, taskTypeId: number, subjectId: number | null, priority: string) => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  baja: "#51cf66",
  media: "#ffa94d",
  alta: "#ff6b6b",
};

function TaskModal({
  date, tasks, taskTypes, subjects,
  onClose, onAddTask, onCompleteTask, onDeleteTask,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [taskTypeId, setTaskTypeId] = useState<number>(taskTypes[0]?.id ?? 0);
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [priority, setPriority] = useState("media");
  const [showAddForm, setShowAddForm] = useState(tasks.length === 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), taskTypeId, subjectId === "" ? null : subjectId, priority);
    setTitle("");
    setShowAddForm(false);
  }

  function typeName(id: number) {
    return taskTypes.find((t) => t.id === id)?.name ?? "";
  }
  function subjectName(id: number | null) {
    if (!id) return null;
    return subjects.find((s) => s.id === id)?.name ?? null;
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={onClose}
    >
      <div style={{ background: "#16263d", padding: 24, borderRadius: 10, width: 360, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Asignación para: {date}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        {tasks.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: "16px 0" }}>
            {tasks.map((task) => (
              <li key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #2a4a6b" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLORS[task.priority] ?? "#888", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ textDecoration: task.status === "done" ? "line-through" : "none", opacity: task.status === "done" ? 0.6 : 1 }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>
                    {typeName(task.task_type_id)}
                    {subjectName(task.subject_id) && ` · ${subjectName(task.subject_id)}`}
                    {task.status === "done" && ` · ${task.grade}% · +${task.points_earned} pts`}
                  </div>
                </div>
                {task.status === "pending" && (
                  <button onClick={() => onCompleteTask(task)}>Completar</button>
                )}
                <button onClick={() => onDeleteTask(task.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}

        {showAddForm ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              autoFocus
              style={{ padding: 8 }}
            />

            <select value={taskTypeId} onChange={(e) => setTaskTypeId(Number(e.target.value))} style={{ padding: 8 }}>
              {taskTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.base_points} pts)</option>
              ))}
            </select>

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value === "" ? "" : Number(e.target.value))}
              style={{ padding: 8 }}
            >
              <option value="">Sin materia</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: 8 }}>
              <option value="baja">Prioridad baja</option>
              <option value="media">Prioridad media</option>
              <option value="alta">Prioridad alta</option>
            </select>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              {tasks.length > 0 && (
                <button type="button" onClick={() => setShowAddForm(false)}>Cancelar</button>
              )}
              <button type="submit">Guardar</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowAddForm(true)} style={{ width: "100%", padding: 10 }}>
            + Agregar tarea
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskModal;