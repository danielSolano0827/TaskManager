import { useState, FormEvent } from "react";

interface Task {
  id: number;
  title: string;
  emoji: string;
  description: string | null;
  tags: string | null;
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
  onAddTask: (data: {
    title: string;
    emoji: string;
    description: string;
    tags: string;
    taskTypeId: number;
    subjectId: number | null;
    priority: string;
  }) => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  baja: "var(--success)",
  media: "var(--warning)",
  alta: "var(--danger)",
};

const EMOJIS = ["📌", "📚", "✏️", "🧪", "💻", "📊", "🎓", "🔬", "📝", "🧠", "⚗️", "📐", "🖥️", "📖", "🗂️"];

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

function TaskModal({
  date, tasks, taskTypes, subjects,
  onClose, onAddTask, onCompleteTask, onDeleteTask,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📌");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [taskTypeId, setTaskTypeId] = useState<number>(taskTypes[0]?.id ?? 0);
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [priority, setPriority] = useState("media");
  const [showAddForm, setShowAddForm] = useState(tasks.length === 0);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      emoji,
      description: description.trim(),
      tags: tagsInput.trim(),
      taskTypeId,
      subjectId: subjectId === "" ? null : subjectId,
      priority,
    });
    setTitle("");
    setDescription("");
    setTagsInput("");
    setEmoji("📌");
    setShowAddForm(false);
  }

  function typeName(id: number) {
    return taskTypes.find((t) => t.id === id)?.name ?? "";
  }
  function subjectInfo(id: number | null) {
    if (!id) return null;
    return subjects.find((s) => s.id === id) ?? null;
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--bg-surface)", borderRadius: 14, width: 600, maxHeight: "85vh", overflowY: "auto", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "18px 20px", borderBottom: "1px solid var(--border)",
            background: "linear-gradient(135deg, var(--bg-surface-alt) 0%, var(--bg-surface) 100%)",
          }}
        >
          <h3 style={{ margin: 0 }}>Asignaciones para: {date}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          {tasks.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map((task) => {
                const subj = subjectInfo(task.subject_id);
                const tagList = parseTags(task.tags);
                const isExpanded = expandedTaskId === task.id;

                return (
                  <li
                    key={task.id}
                    style={{
                      background: "var(--bg-page)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      <span style={{ fontSize: 20 }}>{task.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: PRIORITY_COLORS[task.priority] ?? "#888", flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 500,
                              textDecoration: task.status === "done" ? "line-through" : "none",
                              opacity: task.status === "done" ? 0.6 : 1,
                            }}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                          {typeName(task.task_type_id)}
                          {subj && ` · ${subj.name}`}
                          {task.status === "done" && ` · ${task.grade}% · +${task.points_earned} pts`}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                        {task.description && (
                          <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 10px" }}>{task.description}</p>
                        )}
                        {tagList.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                            {tagList.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: 11, background: "var(--bg-surface-alt)", border: "1px solid var(--border)",
                                  borderRadius: 12, padding: "3px 10px",
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          {task.status === "pending" && (
                            <button onClick={() => onCompleteTask(task)} style={{ flex: 1 }}>Completar</button>
                          )}
                          <button onClick={() => onDeleteTask(task.id)}>Eliminar</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {showAddForm ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ fontSize: 20, padding: "8px 12px", flexShrink: 0 }}
                  >
                    {emoji}
                  </button>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título de la tarea"
                    autoFocus
                    style={{ padding: 8, flex: 1 }}
                  />
                </div>

                {showEmojiPicker && (
                  <div
                    style={{
                      position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 10,
                      background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: 8,
                      padding: 8, display: "flex", flexWrap: "wrap", gap: 4, width: 220,
                    }}
                  >
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                        style={{ fontSize: 18, padding: 4, background: "none", border: "none" }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                rows={3}
                style={{ padding: 8, fontFamily: "inherit", resize: "vertical" }}
              />

              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags separados por coma (ej. importante, capítulo3)"
                style={{ padding: 8 }}
              />

              <div style={{ display: "flex", gap: 8 }}>
                <select value={taskTypeId} onChange={(e) => setTaskTypeId(Number(e.target.value))} style={{ padding: 8, flex: 1 }}>
                  {taskTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.base_points} pts)</option>
                  ))}
                </select>

                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: 8, flex: 1 }}>
                  <option value="baja">🟢 Prioridad Baja</option>
                  <option value="media">🟡 Prioridad Media</option>
                  <option value="alta">🔴 Prioridad Alta</option>
                </select>
              </div>

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

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                {tasks.length > 0 && (
                  <button type="button" onClick={() => setShowAddForm(false)}>Cancelar</button>
                )}
                <button
                  type="submit"
                  style={{ background: "var(--accent)", border: "none", color: "white", fontWeight: 600, borderRadius: 8, padding: "8px 16px" }}
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAddForm(true)} style={{ width: "100%", padding: 12 }}>
              + Agregar tarea
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskModal;