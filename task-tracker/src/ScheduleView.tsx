interface ScheduleSlot {
  id: number;
  subject_id: number;
  day_of_week: number;
  hour: number;
}

interface Subject {
  id: number;
  name: string;
  color: string;
  enabled: number;
}

interface ScheduleViewProps {
  slots: ScheduleSlot[];
  subjects: Subject[];
  onCellClick: (day: number, hour: number) => void;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HOURS = Array.from({ length: 16 }, (_, i) => 7 + i); // 7 a 19

function ScheduleView({ slots, subjects, onCellClick }: ScheduleViewProps) {
  const todayIdx = new Date().getDay();

  function getSlot(day: number, hour: number) {
    return slots.find((s) => s.day_of_week === day && s.hour === hour);
  }
  function getSubject(id: number) {
    return subjects.find((s) => s.id === id);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Horario de clases</h2>

      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "48px repeat(7, minmax(0, 1fr))",
            width: "100%",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <div style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border)" }} />
          {DAYS.map((d, i) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                padding: "12px 4px",
                background: i === todayIdx ? "var(--bg-surface-alt)" : "var(--bg-page)",
                borderBottom: "1px solid var(--border)",
                borderLeft: "1px solid var(--border)",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{DAYS_SHORT[i]}</div>
            </div>
          ))}

          {/* Rows */}
          {HOURS.map((hour, rowIdx) => (
            <>
              <div
                key={`h-${hour}`}
                style={{
                  fontSize: 11,
                  opacity: 0.55,
                  textAlign: "right",
                  paddingRight: 8,
                  paddingTop: 6,
                  borderTop: rowIdx > 0 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                {hour}:00
              </div>
              {DAYS.map((_, day) => {
                const slot = getSlot(day, hour);
                const subject = slot ? getSubject(slot.subject_id) : null;
                const disabled = subject && subject.enabled === 0;

                return (
                  <div
                    key={`${day}-${hour}`}
                    onClick={() => onCellClick(day, hour)}
                    style={{
                      borderTop: rowIdx > 0 ? "1px solid var(--border-subtle)" : "none",
                      borderLeft: "1px solid var(--border-subtle)",
                      minHeight: 46,
                      padding: 3,
                      boxSizing: "border-box",
                      background: day === todayIdx ? "var(--accent-tint)" : "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!subject) e.currentTarget.style.background = "var(--accent-tint)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = day === todayIdx ? "var(--accent-tint)" : "transparent";
                    }}
                  >
                    {subject && (
                      <div
                        style={{
                          height: "100%",
                          background: subject.color,
                          borderRadius: 6,
                          padding: "4px 6px",
                          boxSizing: "border-box",
                          opacity: disabled ? 0.35 : 1,
                          display: "flex",
                          alignItems: "center",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: 600,
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {subject.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, opacity: 0.6 }}>
        <span>💡 Click en una celda vacía para agregar una clase</span>
      </div>
    </div>
  );
}

export default ScheduleView;