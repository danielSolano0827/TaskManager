import { useState, FormEvent } from "react";

interface HabitModalProps {
  onClose: () => void;
  onSave: (data: { name: string; emoji: string; category: string; points: number; color: string }) => void;
}

const EMOJIS = ["✅", "💧", "🏃", "😴", "📚", "🧘", "🥗", "🚭", "💪", "🪥", "☀️", "🧹"];
const COLORS = ["#4f9eff", "#51cf66", "#ffa94d", "#cc5de8", "#22b8cf", "#f06595"];

function HabitModal({ onClose, onSave }: HabitModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✅");
  const [category, setCategory] = useState("");
  const [points, setPoints] = useState(10);
  const [color, setColor] = useState(COLORS[0]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), emoji, category: category.trim(), points, color });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}
    >
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: 24, borderRadius: 12, width: 340 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Nuevo hábito</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 18, padding: 6,
                  border: emoji === e ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: "var(--bg-sunken)",
                }}
              >
                {e}
              </button>
            ))}
          </div>

          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej. Tomar agua)" autoFocus style={{ padding: 8 }} />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoría (ej. Salud, opcional)" style={{ padding: 8 }} />

          <div>
            <label style={{ fontSize: 12, opacity: 0.6 }}>Puntos por completar</label>
            <input type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} style={{ padding: 8, width: "100%", boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: color === c ? "2px solid white" : "1px solid var(--border)", padding: 0 }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HabitModal;