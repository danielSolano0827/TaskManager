interface Subject {
  id: number;
  name: string;
  color: string;
  enabled: number;
}

interface SubjectsManagerProps {
  subjects: Subject[];
  onToggleEnabled: (id: number, enabled: boolean) => void;
  onDelete: (id: number) => void;
}

function SubjectsManager({ subjects, onToggleEnabled, onDelete }: SubjectsManagerProps) {
  if (subjects.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Materias</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {subjects.map((s) => (
          <li
            key={s.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#16263d", border: "1px solid #2a4a6b", borderRadius: 8, padding: "8px 12px",
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            <span style={{ flex: 1 }}>{s.name}</span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={s.enabled === 1}
                onChange={(e) => onToggleEnabled(s.id, e.target.checked)}
              />
              Habilitada
            </label>
            <button onClick={() => onDelete(s.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubjectsManager;