import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import HabitModal from "./HabitModal";
import ConfirmModal from "./ConfirmModal";

interface Habit {
  id: number;
  name: string;
  emoji: string;
  category: string | null;
  points_value: number;
  color: string;
  enabled: number;
}

interface HabitLog {
  id: number;
  habit_id: number;
  log_date: string;
}

interface HabitsViewProps {
  habits: Habit[];
  logs: HabitLog[];
  habitPoints: number;
  habitLevel: number;
  habitRank: string;
  onToggleToday: (habit: Habit, date: string) => void;
  onAddHabit: (data: { name: string; emoji: string; category: string; points: number; color: string }) => void;
  onDeleteHabit: (id: number) => void;
}

const HABIT_RANKS = [
  { rank: "Insalubre", minLevel: 1 },
  { rank: "Algo es Algo", minLevel: 3 },
  { rank: "Normal", minLevel: 6 },
  { rank: "Rico", minLevel: 11 },
  { rank: "Rico Papi", minLevel: 21 },
];

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return days;
}

function HabitsView({ habits, logs, habitPoints, habitLevel, habitRank, onToggleToday, onAddHabit, onDeleteHabit }: HabitsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const today = todayKey();
  const week = lastNDays(7);
  const enabledHabits = habits.filter((h) => h.enabled === 1);

  function hasLog(habitId: number, date: string) {
    return logs.some((l) => l.habit_id === habitId && l.log_date === date);
  }

  const pointsIntoLevel = habitPoints % 100;
  const currentRankIdx = HABIT_RANKS.findIndex((r) => r.rank === habitRank);
  const nextRank = HABIT_RANKS[currentRankIdx + 1];
  const levelsIntoRank = nextRank ? habitLevel - HABIT_RANKS[currentRankIdx].minLevel : 0;
  const levelsForNextRank = nextRank ? nextRank.minLevel - HABIT_RANKS[currentRankIdx].minLevel : 1;

  const chartData = enabledHabits.map((h) => ({
    name: h.name.length > 10 ? h.name.slice(0, 10) + "…" : h.name,
    completados: logs.filter((l) => l.habit_id === h.id && week.includes(l.log_date)).length,
    fill: h.color,
  }));

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Hábitos</h2>

      <div
        style={{
          background: "linear-gradient(135deg, var(--bg-surface-alt) 0%, var(--bg-surface) 100%)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "18px 22px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
          <span>Nivel {habitLevel}</span>
          <span>{pointsIntoLevel}/100 pts para nivel {habitLevel + 1}</span>
        </div>
        <div style={{ background: "var(--bg-sunken)", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ width: `${pointsIntoLevel}%`, height: "100%", background: "var(--accent)" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
          <span>{habitRank}</span>
          <span>{nextRank ? `${levelsIntoRank}/${levelsForNextRank} niveles para ${nextRank.rank}` : "Rango máximo"}</span>
        </div>
        <div style={{ background: "var(--bg-sunken)", borderRadius: 6, height: 8, overflow: "hidden" }}>
          <div style={{ width: nextRank ? `${(levelsIntoRank / levelsForNextRank) * 100}%` : "100%", height: "100%", background: "var(--success)" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Hoy</h3>
        <button onClick={() => setShowModal(true)}>+ Nuevo hábito</button>
      </div>

      {enabledHabits.length === 0 && (
        <p style={{ opacity: 0.6, fontSize: 14 }}>No tienes hábitos creados todavía.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {enabledHabits.map((h) => {
          const done = hasLog(h.id, today);
          return (
            <li
              key={h.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
              }}
            >
              <button
                onClick={() => onToggleToday(h, today)}
                style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: done ? h.color : "var(--bg-sunken)",
                  border: `2px solid ${done ? h.color : "var(--border)"}`,
                  color: "white", fontSize: 14, padding: 0,
                }}
              >
                {done ? "✓" : ""}
              </button>
              <span style={{ fontSize: 18 }}>{h.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{h.name}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>
                  {h.category && `${h.category} · `}{h.points_value} pts
                </div>
              </div>
              <button onClick={() => setDeletingId(h.id)} style={{ fontSize: 12 }}>Eliminar</button>
            </li>
          );
        })}
      </ul>

      {enabledHabits.length > 0 && (
        <>
          <h3>Últimos 7 días</h3>
          <div style={{ overflowX: "auto", marginBottom: 28 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}></th>
                  {week.map((d) => (
                    <th key={d} style={{ padding: 6, opacity: 0.6, fontWeight: 400 }}>
                      {new Date(d + "T00:00").toLocaleDateString("es-ES", { weekday: "short" })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enabledHabits.map((h) => (
                  <tr key={h.id}>
                    <td style={{ padding: 6 }}>{h.emoji} {h.name}</td>
                    {week.map((d) => (
                      <td key={d} style={{ textAlign: "center", padding: 6 }}>
                        <span
                          style={{
                            display: "inline-block", width: 16, height: 16, borderRadius: "50%",
                            background: hasLog(h.id, d) ? h.color : "var(--bg-sunken)",
                            border: `1px solid ${hasLog(h.id, d) ? h.color : "var(--border)"}`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Frecuencia (últimos 7 días)</h3>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--text)" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="var(--text)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--bg-sunken)", border: "1px solid var(--border)", color: "var(--text)" }} />
                <Bar dataKey="completados" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {showModal && (
        <HabitModal onClose={() => setShowModal(false)} onSave={(data) => { onAddHabit(data); setShowModal(false); }} />
      )}

      {deletingId !== null && (
        <ConfirmModal
          title="Eliminar hábito"
          message="¿Seguro que quieres eliminar este hábito? Se perderá su historial."
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { onDeleteHabit(deletingId); setDeletingId(null); }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}

export default HabitsView;