import { useState } from "react";
import RubricModal from "./RubricModal";

interface Subject {
  id: number;
  name: string;
  color: string;
  enabled: number;
}

interface TaskType {
  id: number;
  name: string;
}

interface Task {
  id: number;
  subject_id: number | null;
  task_type_id: number;
  status: string;
  grade: number | null;
}

interface Rubric {
  id: number;
  subject_id: number;
  name: string;
  weight_percent: number;
  type: "manual" | "tasks";
  task_type_id: number | null;
  manual_value: number;
}

interface GradesViewProps {
  subjects: Subject[];
  taskTypes: TaskType[];
  tasks: Task[];
  rubrics: Rubric[];
  onAddRubric: (subjectId: number, data: { name: string; weight: number; type: "manual" | "tasks"; taskTypeId: number | null }) => void;
  onUpdateManualValue: (rubricId: number, value: number) => void;
  onDeleteRubric: (id: number) => void;
}

const PASS_THRESHOLD = 67.5;

function GradesView({ subjects, taskTypes, tasks, rubrics, onAddRubric, onUpdateManualValue, onDeleteRubric }: GradesViewProps) {
  const enabledSubjects = subjects.filter((s) => s.enabled === 1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(enabledSubjects[0]?.id ?? null);
  const [showRubricModal, setShowRubricModal] = useState(false);

  const subjectRubrics = rubrics.filter((r) => r.subject_id === selectedSubjectId);
  const totalWeight = subjectRubrics.reduce((sum, r) => sum + r.weight_percent, 0);

  function taskTypeName(id: number | null) {
    return taskTypes.find((t) => t.id === id)?.name ?? "";
  }

  function computeRubricValue(rubric: Rubric): number {
    if (rubric.type === "manual") return rubric.manual_value;

    const relevant = tasks.filter(
      (t) =>
        t.subject_id === rubric.subject_id &&
        t.task_type_id === rubric.task_type_id &&
        t.status === "done" &&
        t.grade !== null
    );
    if (relevant.length === 0) return 0;
    const avg = relevant.reduce((sum, t) => sum + (t.grade ?? 0), 0) / relevant.length;
    return avg;
  }

  const totalScore = subjectRubrics.reduce(
    (sum, r) => sum + computeRubricValue(r) * (r.weight_percent / 100),
    0
  );

  const passed = totalScore >= PASS_THRESHOLD;

  if (enabledSubjects.length === 0) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2>Calificaciones</h2>
        <p style={{ opacity: 0.6 }}>No tienes materias habilitadas. Ve a Horario para crear o habilitar alguna.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>Calificaciones</h2>

      <select
        value={selectedSubjectId ?? ""}
        onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
        style={{ padding: 10, marginBottom: 20, width: "100%" }}
      >
        {enabledSubjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {selectedSubjectId && (
        <>
          <div
            style={{
              background: passed ? "var(--success-tint)" : "var(--danger-tint)",
              border: `1px solid ${passed ? "var(--success)" : "var(--danger)"}`,
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: passed ? "var(--success)" : "var(--danger)" }}>
                {totalScore.toFixed(1)}
              </div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {passed ? "Vas aprobando" : "Por debajo de aprobación"} · mínimo {PASS_THRESHOLD}
              </div>
            </div>
            {totalWeight !== 100 && (
              <div style={{ fontSize: 12, color: "var(--warning)", textAlign: "right" }}>
                ⚠️ Los rubros suman {totalWeight}%, no 100%
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Rubros</h3>
            <button onClick={() => setShowRubricModal(true)}>+ Agregar rubro</button>
          </div>

          {subjectRubrics.length === 0 && (
            <p style={{ opacity: 0.6, fontSize: 14 }}>Aún no has agregado rubros para esta materia.</p>
          )}

          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {subjectRubrics.map((rubric) => {
              const value = computeRubricValue(rubric);
              return (
                <li
                  key={rubric.id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{rubric.name}</span>
                      <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 8 }}>
                        {rubric.weight_percent}% de la nota
                        {rubric.type === "tasks" && ` · auto (${taskTypeName(rubric.task_type_id)})`}
                      </span>
                    </div>
                    <button onClick={() => onDeleteRubric(rubric.id)} style={{ fontSize: 12 }}>Eliminar</button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, background: "var(--bg-page)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(value, 100)}%`,
                          height: "100%",
                          background: "var(--accent)",
                        }}
                      />
                    </div>

                    {rubric.type === "manual" ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={rubric.manual_value}
                        onChange={(e) => onUpdateManualValue(rubric.id, Number(e.target.value))}
                        style={{ width: 60, padding: 4, textAlign: "center" }}
                      />
                    ) : (
                      <span style={{ minWidth: 50, textAlign: "right", fontSize: 13 }}>{value.toFixed(1)}%</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {showRubricModal && selectedSubjectId && (
        <RubricModal
          taskTypes={taskTypes}
          onClose={() => setShowRubricModal(false)}
          onSave={(data) => {
            onAddRubric(selectedSubjectId, data);
            setShowRubricModal(false);
          }}
        />
      )}
    </div>
  );
}

export default GradesView;