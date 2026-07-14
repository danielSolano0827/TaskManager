import { Fragment } from "react";

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
const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i); // 7 a 19

function ScheduleView({ slots, subjects, onCellClick }: ScheduleViewProps) {
  function getSlot(day: number, hour: number) {
    return slots.find((s) => s.day_of_week === day && s.hour === hour);
  }
  function getSubject(id: number) {
    return subjects.find((s) => s.id === id);
  }

  return (
    <div>
      <h2>Horario de clases</h2>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", minWidth: 800 }}>
          <div />
          {DAYS.map((d) => (
            <div key={d} style={{ textAlign: "center", fontWeight: 600, padding: 8, fontSize: 12 }}>
              {d}
            </div>
          ))}

          {HOURS.map((hour) => (
            <Fragment key={`row-${hour}`}>
              <div style={{ fontSize: 11, opacity: 0.6, textAlign: "right", paddingRight: 6, paddingTop: 10, borderTop: "1px solid #2a4a6b" }}>
                {hour}:00
              </div>
              {DAYS.map((_, day) => {
                const slot = getSlot(day, hour);
                const subject = slot ? getSubject(slot.subject_id) : null;
                return (
                  <div
                    key={`${day}-${hour}`}
                    onClick={() => onCellClick(day, hour)}
                    style={{
                      border: "1px solid #2a4a6b",
                      borderRadius: subject ? 6 : 0,
                      margin: subject ? 2 : 0,
                      minHeight: 44,
                      cursor: "pointer",
                      background: subject ? subject.color : "transparent",
                      color: "white",
                      fontSize: 11,
                      padding: 4,
                      boxSizing: "border-box",
                      opacity: subject && subject.enabled === 0 ? 0.4 : 1,
                      textAlign: "center",
                    }}
                  >
                    {subject?.name}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScheduleView;