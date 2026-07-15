import { useState, FormEvent } from "react";

interface SemesterModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

function SemesterModal({ onClose, onSave }: SemesterModalProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}
    >
      <div style={{ background: "#16263d", padding: 24, borderRadius: 10, width: 320 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Nuevo semestre</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. 2026 - I Semestre"
            autoFocus
            style={{ padding: 8 }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SemesterModal;