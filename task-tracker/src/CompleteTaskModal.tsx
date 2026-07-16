import { useState } from "react";

interface Task {
  id: number;
  title: string;
  task_type_id: number;
}

interface TaskType {
  id: number;
  name: string;
  base_points: number;
}

interface CompleteTaskModalProps {
  task: Task;
  taskType: TaskType;
  onClose: () => void;
  onConfirm: (grade: number) => void;
}

function CompleteTaskModal({ task, taskType, onClose, onConfirm }: CompleteTaskModalProps) {
  const [grade, setGrade] = useState(100);
  const pointsPreview = Math.round(taskType.base_points * (grade / 100));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1e1e1e",
          padding: 28,
          borderRadius: 12,
          width: 340,
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: 4 }}>{task.title}</h3>
        <p style={{ marginTop: 0, opacity: 0.6, fontSize: 13 }}>{taskType.name} · {taskType.base_points} pts base</p>

        <div style={{ margin: "28px 0" }}>
          <div style={{ fontSize: 42, fontWeight: 700 }}>{grade}%</div>
          <input
            type="range"
            min={0}
            max={100}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            style={{
              width: "88%",
              marginTop: 20,
              WebkitAppearance: "none",
              appearance: "none",
              height: 0,
              borderRadius: 8,
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${grade}%, var(--border) ${grade}%, var(--border) 100%)`,
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>

        <div
          style={{
            background: "#2a2a2a",
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <span style={{ opacity: 0.7 }}>Puntos a ganar: </span>
          <strong style={{ color: "var(--accent)", fontSize: 18 }}>+{pointsPreview}</strong>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "8px 16px" }}>Cancelar</button>
          <button
            onClick={() => onConfirm(grade)}
            style={{ padding: "8px 16px", background: "var(--accent)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteTaskModal;