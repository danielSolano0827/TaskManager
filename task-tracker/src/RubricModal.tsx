import { useState, FormEvent } from "react";

interface TaskType {
  id: number;
  name: string;
}

interface RubricModalProps {
  taskTypes: TaskType[];
  onClose: () => void;
  onSave: (data: { name: string; weight: number; type: "manual" | "tasks"; taskTypeId: number | null }) => void;
}

function RubricModal({ taskTypes, onClose, onSave }: RubricModalProps) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(10);
  const [type, setType] = useState<"manual" | "tasks">("manual");
  const [taskTypeId, setTaskTypeId] = useState<number>(taskTypes[0]?.id ?? 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      weight,
      type,
      taskTypeId: type === "tasks" ? taskTypeId : null,
    });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}
    >
      <div style={{ background: "#16263d", padding: 24, borderRadius: 10, width: 340 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Nuevo rubro</h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej. Asistencia, Exámenes)"
            autoFocus
            style={{ padding: 8 }}
          />

          <div>
            <label style={{ fontSize: 12, opacity: 0.6 }}>Peso en la nota final (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.6 }}>Tipo de rubro</label>
            <select value={type} onChange={(e) => setType(e.target.value as "manual" | "tasks")} style={{ padding: 8, width: "100%" }}>
              <option value="manual">Manual (ingresas el % a mano)</option>
              <option value="tasks">Automático desde tareas</option>
            </select>
          </div>

          {type === "tasks" && (
            <div>
              <label style={{ fontSize: 12, opacity: 0.6 }}>Vincular a tipo de tarea</label>
              <select value={taskTypeId} onChange={(e) => setTaskTypeId(Number(e.target.value))} style={{ padding: 8, width: "100%" }}>
                {taskTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                Se promedian las calificaciones de las tareas completadas de este tipo en esta materia.
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RubricModal;