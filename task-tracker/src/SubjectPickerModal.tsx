import { useState } from "react";

interface Subject {
  id: number;
  name: string;
  color: string;
  enabled: number;
}

interface SubjectPickerModalProps {
  day: number;
  hour: number;
  dayLabel: string;
  currentSubjectId: number | null;
  subjects: Subject[];
  onClose: () => void;
  onAssign: (subjectId: number) => void;
  onCreateAndAssign: (name: string, color: string) => void;
  onRemove: () => void;
}

const COLORS = ["#4f9eff", "#ff6b6b", "#51cf66", "#ffa94d", "#cc5de8", "#22b8cf", "#f06595"];

function SubjectPickerModal({
  hour, dayLabel, currentSubjectId, subjects,
  onClose, onAssign, onCreateAndAssign, onRemove,
}: SubjectPickerModalProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={onClose}
    >
      <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: 10, width: 320 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{dayLabel} · {hour}:00</h3>

        {subjects.length > 0 && (
          <>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Elegir materia existente</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onAssign(s.id)}
                  style={{
                    background: s.color,
                    color: "white",
                    border: currentSubjectId === s.id ? "2px solid white" : "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 13,
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </>
        )}

        <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>O crear nueva materia</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la materia"
            style={{ padding: 8 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: "50%", background: c,
                  border: newColor === c ? "2px solid white" : "1px solid var(--border)", padding: 0,
                }}
              />
            ))}
          </div>
          <button
            onClick={() => newName.trim() && onCreateAndAssign(newName.trim(), newColor)}
            style={{ padding: 8 }}
          >
            Crear y asignar
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          {currentSubjectId !== null && (
            <button onClick={onRemove} style={{ color: "#ff6b6b" }}>Quitar de este bloque</button>
          )}
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default SubjectPickerModal;