import { useState, useEffect } from "react";
import { getDb } from "./db";
import { isOverdue } from "./dateUtils";
import AuthForm from "./AuthForm";
import Sidebar from "./Sidebar";
import CalendarView from "./CalendarView";
import UpcomingTasksList from "./UpcomingTasksList";
import TaskModal from "./TaskModal";
import CompleteTaskModal from "./CompleteTaskModal";
import ScheduleView from "./ScheduleView";
import SubjectsManager from "./SubjectsManager";
import SubjectPickerModal from "./SubjectPickerModal";
import SettingsView from "./SettingsView";
import { User } from "./auth";
import "./App.css";

interface Task {
  id: number;
  title: string;
  status: "pending" | "done";
  task_type_id: number;
  subject_id: number | null;
  priority: "baja" | "media" | "alta";
  grade: number | null;
  points_earned: number;
  due_date: string;
}

interface TaskType {
  id: number;
  name: string;
  base_points: number;
}

interface Subject {
  id: number;
  name: string;
  color: string;
  enabled: number;
}

interface ScheduleSlot {
  id: number;
  subject_id: number;
  day_of_week: number;
  hour: number;
}

const RANK_THRESHOLDS = [
  { rank: "Vagazo", minLevel: 1 },
  { rank: "Aprendiz", minLevel: 3 },
  { rank: "Competente", minLevel: 6 },
  { rank: "Experto", minLevel: 11 },
  { rank: "Maestro", minLevel: 21 },
];

function computeRank(level: number): string {
  let current = RANK_THRESHOLDS[0].rank;
  for (const r of RANK_THRESHOLDS) {
    if (level >= r.minLevel) current = r.rank;
  }
  return current;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [pickerCell, setPickerCell] = useState<{ day: number; hour: number } | null>(null);

  async function loadTaskTypes() {
    const db = await getDb();
    const result = await db.select<TaskType[]>("SELECT * FROM task_types");
    setTaskTypes(result);
  }

  async function loadTasks(userId: number) {
    const db = await getDb();
    const result = await db.select<Task[]>(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC",
      [userId]
    );
    setTasks(result);
  }

  async function loadSubjects(userId: number) {
    const db = await getDb();
    const result = await db.select<Subject[]>(
      "SELECT * FROM subjects WHERE user_id = $1",
      [userId]
    );
    setSubjects(result);
  }

  async function loadScheduleSlots(userId: number) {
    const db = await getDb();
    const result = await db.select<ScheduleSlot[]>(
      "SELECT * FROM schedule_slots WHERE user_id = $1",
      [userId]
    );
    setScheduleSlots(result);
  }

  async function refreshUser(userId: number) {
    const db = await getDb();
    const [updated] = await db.select<User[]>(
      "SELECT id, username, points, level, rank FROM users WHERE id = $1",
      [userId]
    );
    setUser(updated);
  }

  useEffect(() => {
    if (user) {
      loadTaskTypes();
      loadTasks(user.id);
      loadSubjects(user.id);
      loadScheduleSlots(user.id);
    }
  }, [user?.id]);

  function handleLogout() {
    setUser(null);
    setTasks([]);
    setSubjects([]);
    setScheduleSlots([]);
    setSelectedDate(null);
    setTaskToComplete(null);
    setPickerCell(null);
    setCurrentPage("dashboard");
  }

  // ---- Tareas ----

  async function handleAddTask(
    title: string,
    taskTypeId: number,
    subjectId: number | null,
    priority: string
  ) {
    if (!user || !selectedDate) return;
    const db = await getDb();
    await db.execute(
      "INSERT INTO tasks (user_id, task_type_id, subject_id, title, due_date, priority) VALUES ($1, $2, $3, $4, $5, $6)",
      [user.id, taskTypeId, subjectId, title, selectedDate, priority]
    );
    await loadTasks(user.id);
  }

  async function handleConfirmComplete(grade: number) {
    if (!user || !taskToComplete) return;
    const db = await getDb();

    const type = taskTypes.find((t) => t.id === taskToComplete.task_type_id)!;
    const pointsEarned = Math.round(type.base_points * (grade / 100));

    await db.execute(
      "UPDATE tasks SET status = 'done', grade = $1, points_earned = $2 WHERE id = $3",
      [grade, pointsEarned, taskToComplete.id]
    );

    const newPoints = user.points + pointsEarned;
    const newLevel = Math.floor(newPoints / 100) + 1;
    const newRank = computeRank(newLevel);

    await db.execute(
      "UPDATE users SET points = $1, level = $2, rank = $3 WHERE id = $4",
      [newPoints, newLevel, newRank, user.id]
    );

    setTaskToComplete(null);
    await refreshUser(user.id);
    await loadTasks(user.id);
  }

  async function handleDeleteTask(id: number) {
    if (!user) return;
    const db = await getDb();
    await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
    await loadTasks(user.id);
  }

  // ---- Horario / Materias ----

  async function handleCreateAndAssign(name: string, color: string) {
    if (!user || !pickerCell) return;
    const db = await getDb();
    await db.execute(
      "INSERT INTO subjects (user_id, name, color) VALUES ($1, $2, $3)",
      [user.id, name, color]
    );
    const [newSubject] = await db.select<Subject[]>(
      "SELECT * FROM subjects WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
      [user.id]
    );
    await assignSlot(newSubject.id);
  }

  async function assignSlot(subjectId: number) {
    if (!user || !pickerCell) return;
    const db = await getDb();
    const existing = scheduleSlots.find(
      (s) => s.day_of_week === pickerCell.day && s.hour === pickerCell.hour
    );
    if (existing) {
      await db.execute("UPDATE schedule_slots SET subject_id = $1 WHERE id = $2", [
        subjectId,
        existing.id,
      ]);
    } else {
      await db.execute(
        "INSERT INTO schedule_slots (user_id, subject_id, day_of_week, hour) VALUES ($1, $2, $3, $4)",
        [user.id, subjectId, pickerCell.day, pickerCell.hour]
      );
    }
    setPickerCell(null);
    await loadSubjects(user.id);
    await loadScheduleSlots(user.id);
  }

  async function handleRemoveSlot() {
    if (!user || !pickerCell) return;
    const db = await getDb();
    const existing = scheduleSlots.find(
      (s) => s.day_of_week === pickerCell.day && s.hour === pickerCell.hour
    );
    if (existing) {
      await db.execute("DELETE FROM schedule_slots WHERE id = $1", [existing.id]);
    }
    setPickerCell(null);
    await loadScheduleSlots(user.id);
  }

  async function handleToggleSubjectEnabled(id: number, enabled: boolean) {
    if (!user) return;
    const db = await getDb();
    await db.execute("UPDATE subjects SET enabled = $1 WHERE id = $2", [
      enabled ? 1 : 0,
      id,
    ]);
    await loadSubjects(user.id);
  }

  async function handleDeleteSubject(id: number) {
    if (!user) return;
    const db = await getDb();
    await db.execute("DELETE FROM schedule_slots WHERE subject_id = $1", [id]);
    await db.execute("DELETE FROM subjects WHERE id = $1", [id]);
    await loadSubjects(user.id);
    await loadScheduleSlots(user.id);
  }

  if (!user) {
    return <AuthForm onAuthenticated={setUser} />;
  }

  // ---- Datos derivados ----

  const tasksByDate: Record<string, { count: number; hasOverdue: boolean }> = {};
  for (const t of tasks) {
    if (!tasksByDate[t.due_date]) {
      tasksByDate[t.due_date] = { count: 0, hasOverdue: false };
    }
    tasksByDate[t.due_date].count += 1;
    if (isOverdue(t.due_date, t.status)) {
      tasksByDate[t.due_date].hasOverdue = true;
    }
  }

  const tasksForSelectedDate = tasks.filter((t) => t.due_date === selectedDate);
  const typeForCompleting = taskToComplete
    ? taskTypes.find((t) => t.id === taskToComplete.task_type_id)
    : null;

  const pointsIntoLevel = user.points % 100;
  const pointsForNextLevel = 100;

  const currentRankIdx = RANK_THRESHOLDS.findIndex((r) => r.rank === user.rank);
  const nextRank = RANK_THRESHOLDS[currentRankIdx + 1];
  const levelsIntoRank = nextRank
    ? user.level - RANK_THRESHOLDS[currentRankIdx].minLevel
    : 0;
  const levelsForNextRank = nextRank
    ? nextRank.minLevel - RANK_THRESHOLDS[currentRankIdx].minLevel
    : 1;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        username={user.username}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      <div style={{ flex: 1, padding: 20 }}>
        {currentPage === "dashboard" && (
          <div style={{ maxWidth: 1500, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #16263d 0%, #1e3a5f 100%)",
                border: "1px solid #2a4a6b",
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 24,
                gap: 24,
              }}
            >
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, fontSize: 24 }}>Hola, {user.username}</h1>
                <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: 14 }}>
                  Sigue mejorando.
                </p>

                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      opacity: 0.6,
                      marginBottom: 4,
                    }}
                  >
                    <span>Nivel {user.level}</span>
                    <span>
                      {pointsIntoLevel}/{pointsForNextLevel} pts para nivel {user.level + 1}
                    </span>
                  </div>
                  <div style={{ background: "#0f1b2d", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${(pointsIntoLevel / pointsForNextLevel) * 100}%`,
                        height: "100%",
                        background: "#4f9eff",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      opacity: 0.6,
                      marginBottom: 4,
                    }}
                  >
                    <span>{user.rank}</span>
                    <span>
                      {nextRank
                        ? `${levelsIntoRank}/${levelsForNextRank} niveles para ${nextRank.rank}`
                        : "Rango máximo alcanzado"}
                    </span>
                  </div>
                  <div style={{ background: "#0f1b2d", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: nextRank ? `${(levelsIntoRank / levelsForNextRank) * 100}%` : "100%",
                        height: "100%",
                        background: "#51cf66",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    background: "#0f1b2d",
                    border: "1px solid #2a4a6b",
                    borderRadius: 10,
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#4f9eff" }}>{user.level}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Nivel</div>
                </div>

                <div
                  style={{
                    background: "#0f1b2d",
                    border: "1px solid #2a4a6b",
                    borderRadius: 10,
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e8f0ff", whiteSpace: "nowrap" }}>
                    {user.rank}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Rango</div>
                </div>

                <div
                  style={{
                    background: "#0f1b2d",
                    border: "1px solid #2a4a6b",
                    borderRadius: 10,
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#4f9eff" }}>{user.points}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Puntos</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <CalendarView tasksByDate={tasksByDate} onSelectDay={setSelectedDate} />
              </div>
              <UpcomingTasksList
                tasks={tasks}
                taskTypes={taskTypes}
                subjects={subjects}
                onSelectTask={setSelectedDate}
              />
            </div>
          </div>
        )}

        {currentPage === "schedule" && (
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 500 }}>
                <ScheduleView
                  slots={scheduleSlots}
                  subjects={subjects}
                  onCellClick={(day, hour) => setPickerCell({ day, hour })}
                />
              </div>
              <SubjectsManager
                subjects={subjects}
                onToggleEnabled={handleToggleSubjectEnabled}
                onDelete={handleDeleteSubject}
              />
            </div>
          </div>
        )}

        {currentPage === "settings" && <SettingsView />}

        {selectedDate && (
          <TaskModal
            date={selectedDate}
            tasks={tasksForSelectedDate}
            taskTypes={taskTypes}
            subjects={subjects.filter((s) => s.enabled === 1)}
            onClose={() => setSelectedDate(null)}
            onAddTask={handleAddTask}
            onCompleteTask={setTaskToComplete}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {taskToComplete && typeForCompleting && (
          <CompleteTaskModal
            task={taskToComplete}
            taskType={typeForCompleting}
            onClose={() => setTaskToComplete(null)}
            onConfirm={handleConfirmComplete}
          />
        )}

        {pickerCell && (
          <SubjectPickerModal
            day={pickerCell.day}
            hour={pickerCell.hour}
            dayLabel={
              ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][
                pickerCell.day
              ]
            }
            currentSubjectId={
              scheduleSlots.find(
                (s) => s.day_of_week === pickerCell.day && s.hour === pickerCell.hour
              )?.subject_id ?? null
            }
            subjects={subjects}
            onClose={() => setPickerCell(null)}
            onAssign={assignSlot}
            onCreateAndAssign={handleCreateAndAssign}
            onRemove={handleRemoveSlot}
          />
        )}
      </div>
    </div>
  );
}

export default App;