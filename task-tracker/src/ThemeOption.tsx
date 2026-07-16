interface ThemeOption {
  id: string;
  name: string;
  colors: string[];
}

const THEMES: ThemeOption[] = [
  { id: "ocean", name: "Océano", colors: ["#0f1b2d", "#4f9eff"] },
  { id: "forest", name: "Bosque", colors: ["#0f2318", "#4fd97e"] },
  { id: "sunset", name: "Atardecer", colors: ["#2d150f", "#ff8f4f"] },
  { id: "violet", name: "Púrpura", colors: ["#1d0f2d", "#b04fff"] },
];

interface ThemeSelectorProps {
  current: string;
  onSelect: (theme: string) => void;
}

function ThemeSelector({ current, onSelect }: ThemeSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "12px 0" }}>
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: 10,
            border: current === t.id ? "2px solid var(--accent)" : "1px solid var(--border)",
            borderRadius: 10,
            background: "var(--bg-sunken)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", width: 60, height: 32 }}>
            <div style={{ flex: 1, background: t.colors[0] }} />
            <div style={{ flex: 1, background: t.colors[1] }} />
          </div>
          <span style={{ fontSize: 12 }}>{t.name}</span>
        </button>
      ))}
    </div>
  );
}

export default ThemeSelector;