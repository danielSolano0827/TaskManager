import { useState } from "react";
import { todayKey } from "./dateUtils";

interface DayInfo {
  pending: number;
  done: number;
  overdue: number;
}

interface CalendarViewProps {
  tasksByDate: Record<string, DayInfo>;
  onSelectDay: (date: string) => void;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function toDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function CalendarView({ tasksByDate, onSelectDay }: CalendarViewProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tKey = todayKey();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={prevMonth}>◀</button>
        <h2 style={{ margin: 0 }}>{MONTH_NAMES[month]} {year}</h2>
        <button onClick={nextMonth}>▶</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 12, opacity: 0.6 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;

          const dateKey = toDateKey(year, month, day);
          const info = tasksByDate[dateKey];
          const isToday = dateKey === tKey;
          const hasOverdue = (info?.overdue ?? 0) > 0;

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(dateKey)}
              style={{
                aspectRatio: "1",
                border: hasOverdue
                  ? "2px solid var(--danger)"
                  : isToday
                  ? "2px solid var(--accent)"
                  : "1px solid var(--border)",
                borderRadius: 6,
                background: hasOverdue ? "var(--danger-tint)" : "transparent",
                color: "inherit",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                gap: 2,
              }}
            >
              <span>{day}</span>
              {info && (
                <div style={{ display: "flex", gap: 3 }}>
                  {info.pending > 0 && (
                    <span
                      title={`${info.pending} pendiente(s)`}
                      style={{
                        fontSize: 9,
                        background: "var(--accent)",
                        color: "white",
                        borderRadius: "50%",
                        width: 14,
                        height: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {info.pending}
                    </span>
                  )}
                  {info.done > 0 && (
                    <span
                      title={`${info.done} completada(s)`}
                      style={{
                        fontSize: 9,
                        background: "var(--success)",
                        color: "white",
                        borderRadius: "50%",
                        width: 14,
                        height: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {info.done}
                    </span>
                  )}
                  {info.overdue > 0 && (
                    <span
                      title={`${info.overdue} vencida(s)`}
                      style={{
                        fontSize: 9,
                        background: "var(--danger)",
                        color: "white",
                        borderRadius: "50%",
                        width: 14,
                        height: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {info.overdue}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, opacity: 0.6, justifyContent: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} /> Pendiente
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} /> Completada
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} /> Vencida
        </span>
      </div>
    </div>
  );
}

export default CalendarView;