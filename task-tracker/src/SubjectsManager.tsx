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
  return (
    <div style={{ flex: 1, minWidth: 220 }}>
      <h2 style={{ marginTop: 16 }}>Materias</h2>

      {subjects.length === 0 && (
        <p style={{ opacity: 0.6, fontSize: 14 }}>Aún no has creado materias.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {subjects.map((s) => (
          <li
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#16263d",
              border: "1px solid #2a4a6b",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14 }}>{s.name}</span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: 0.8 }}>
              <input
                type="checkbox"
                checked={s.enabled === 1}
                onChange={(e) => onToggleEnabled(s.id, e.target.checked)}
              />
              Activa
            </label>
            <button onClick={() => onDelete(s.id)} style={{ fontSize: 12 }}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubjectsManager;