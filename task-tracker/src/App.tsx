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
import GradesView from "./GradesView";
import SettingsView from "./SettingsView";
import SemesterSelector from "./SemesterSelector";
import BooksView from "./BooksView";
import AllTasksView from "./AllTasksView";
import { User } from "./auth";
import "./App.css";

interface Task {
  id: number;
  title: string;
  emoji: string;
  description: string | null;
  tags: string | null;
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
  semester_id: number;
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

interface Rubric {
  id: number;
  subject_id: number;
  name: string;
  weight_percent: number;
  type: "manual" | "tasks";
  task_type_id: number | null;
  manual_value: number;
}

interface Semester {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  author: string | null;
  genre: string | null;
  year: number | null;
  total_pages: number | null;
  pages_read: number;
  status: "reading" | "completed" | "paused" | "wishlist";
  rating: number | null;
  notes: string | null;
  cover_image: string | null;
}

const RANK_THRESHOLDS = [
  { rank: "Vagazo", minLevel: 1 },
  { rank: "Vago", minLevel: 3 },
  { rank: "Normal", minLevel: 6 },
  { rank: "Volado", minLevel: 11 },
  { rank: "Saico", minLevel: 21 },
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

  const [rubrics, setRubrics] = useState<Rubric[]>([]);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [scheduleSemesterId, setScheduleSemesterId] = useState<number | null>(null);
  const [gradesSemesterId, setGradesSemesterId] = useState<number | null>(null);

  const [books, setBooks] = useState<Book[]>([]);

  //Funciones de carga de datos desde la base de datos
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

  async function loadRubrics(userId: number) {
    const db = await getDb();
    const result = await db.select<Rubric[]>(
      `SELECT gr.* FROM grading_rubrics gr
      JOIN subjects s ON gr.subject_id = s.id
      WHERE s.user_id = $1`,
      [userId]
    );
    setRubrics(result);
  }

  async function loadSemesters(userId: number) {
    const db = await getDb();
    const result = await db.select<Semester[]>(
      "SELECT * FROM semesters WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    setSemesters(result);
    if (result.length > 0) {
      setScheduleSemesterId((prev) => prev ?? result[0].id);
      setGradesSemesterId((prev) => prev ?? result[0].id);
    }
  }

  async function loadBooks(userId: number) {
    const db = await getDb();
    const result = await db.select<Book[]>(
      "SELECT * FROM books WHERE user_id = $1 ORDER BY updated_at DESC",
      [userId]
    );
    setBooks(result);
  }

  async function refreshUser(userId: number) {
    const db = await getDb();
    const [updated] = await db.select<User[]>(
      "SELECT id, username, points, level, rank, theme FROM users WHERE id = $1",
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
      loadRubrics(user.id);
      loadSemesters(user.id);
      loadBooks(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", user?.theme ?? "ocean");
  }, [user?.theme]);

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

  async function handleAddTask(data: {
  title: string;
  emoji: string;
  description: string;
  tags: string;
  taskTypeId: number;
  subjectId: number | null;
  priority: string;
}) {
  if (!user || !selectedDate) return;
  const db = await getDb();
  await db.execute(
    "INSERT INTO tasks (user_id, task_type_id, subject_id, title, emoji, description, tags, due_date, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [
      user.id,
      data.taskTypeId,
      data.subjectId,
      data.title,
      data.emoji,
      data.description || null,
      data.tags || null,
      selectedDate,
      data.priority,
    ]
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

  async function handleEditTask(taskId: number, data: {
    title: string; emoji: string; description: string; tags: string;
    taskTypeId: number; subjectId: number | null; priority: string;
  }) {
    if (!user) return;
    const db = await getDb();
    await db.execute(
      `UPDATE tasks SET title=$1, emoji=$2, description=$3, tags=$4, task_type_id=$5, subject_id=$6, priority=$7 WHERE id=$8`,
      [data.title, data.emoji, data.description || null, data.tags || null, data.taskTypeId, data.subjectId, data.priority, taskId]
    );
    await loadTasks(user.id);
  }

  // ---- Horario / Materias ----

  async function handleCreateAndAssign(name: string, color: string) {
    if (!user || !pickerCell || !scheduleSemesterId) return;
    const db = await getDb();
    await db.execute(
      "INSERT INTO subjects (user_id, semester_id, name, color) VALUES ($1, $2, $3, $4)",
      [user.id, scheduleSemesterId, name, color]
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

// ----------------- Rubricas -----------------
  async function handleAddRubric(
    subjectId: number,
    data: { name: string; weight: number; type: "manual" | "tasks"; taskTypeId: number | null }
  ) {
    if (!user) return;
    const db = await getDb();
    await db.execute(
      "INSERT INTO grading_rubrics (subject_id, name, weight_percent, type, task_type_id) VALUES ($1, $2, $3, $4, $5)",
      [subjectId, data.name, data.weight, data.type, data.taskTypeId]
    );
    await loadRubrics(user.id);
  }

  async function handleUpdateManualValue(rubricId: number, value: number) {
    if (!user) return;
    const db = await getDb();
    await db.execute("UPDATE grading_rubrics SET manual_value = $1 WHERE id = $2", [value, rubricId]);
    await loadRubrics(user.id);
  }

  async function handleDeleteRubric(id: number) {
    if (!user) return;
    const db = await getDb();
    await db.execute("DELETE FROM grading_rubrics WHERE id = $1", [id]);
    await loadRubrics(user.id);
  }

  if (!user) {
    return <AuthForm onAuthenticated={setUser} />;
  }

  // ----------------- Semestres -----------------
  async function handleCreateSemester(name: string, target: "schedule" | "grades") {
    if (!user) return;
    const db = await getDb();
    await db.execute("INSERT INTO semesters (user_id, name) VALUES ($1, $2)", [user.id, name]);
    const [newSemester] = await db.select<Semester[]>(
      "SELECT * FROM semesters WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
      [user.id]
    );
    await loadSemesters(user.id);
    if (target === "schedule") setScheduleSemesterId(newSemester.id);
    else setGradesSemesterId(newSemester.id);
  }

  // ----------------- Temas -----------------
  async function handleThemeChange(theme: string) {
    if (!user) return;
    const db = await getDb();
    await db.execute("UPDATE users SET theme = $1 WHERE id = $2", [theme, user.id]);
    setUser({ ...user, theme });
  }

  // ----------------- Libros -----------------
  async function handleAddBook(data: any) {
    if (!user) return;
    const db = await getDb();
    await db.execute(
      `INSERT INTO books (user_id, title, author, genre, year, total_pages, pages_read, status, rating, notes, cover_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        user.id, data.title, data.author || null, data.genre || null, data.year,
        data.totalPages, data.pagesRead, data.status, data.rating, data.notes || null, data.coverImage,
      ]
    );
    await loadBooks(user.id);
  }

  async function handleUpdateBook(id: number, data: any) {
    if (!user) return;
    const db = await getDb();
    await db.execute(
      `UPDATE books SET title=$1, author=$2, genre=$3, year=$4, total_pages=$5, pages_read=$6, status=$7, rating=$8, notes=$9, cover_image=$10 WHERE id=$11`,
      [
        data.title, data.author || null, data.genre || null, data.year,
        data.totalPages, data.pagesRead, data.status, data.rating, data.notes || null, data.coverImage, id,
      ]
    );
    await loadBooks(user.id);
  }

  async function handleDeleteBook(id: number) {
    if (!user) return;
    const db = await getDb();
    await db.execute("DELETE FROM books WHERE id = $1", [id]);
    await loadBooks(user.id);
  }
  // ---- Datos derivados ----

  const tasksByDate: Record<string, { pending: number; done: number; overdue: number }> = {};
  for (const t of tasks) {
    if (!tasksByDate[t.due_date]) {
      tasksByDate[t.due_date] = { pending: 0, done: 0, overdue: 0 };
    }
    if (t.status === "done") {
      tasksByDate[t.due_date].done += 1;
    } else if (isOverdue(t.due_date, t.status)) {
      tasksByDate[t.due_date].overdue += 1;
    } else {
      tasksByDate[t.due_date].pending += 1;
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
                background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-alt) 100%)",
                border: "1px solid var(--border)",
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
                  <div style={{ background: "var(--bg-page)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${(pointsIntoLevel / pointsForNextLevel) * 100}%`,
                        height: "100%",
                        background: "var(--accent)",
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
                  <div style={{ background: "var(--bg-page)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: nextRank ? `${(levelsIntoRank / levelsForNextRank) * 100}%` : "100%",
                        height: "100%",
                        background: "var(--success)",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    background: "var(--bg-page)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{user.level}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Nivel</div>
                </div>

                <div
                  style={{
                    background: "var(--bg-page)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>
                    {user.rank}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Rango</div>
                </div>

                <div
                  style={{
                    background: "var(--bg-page)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{user.points}</div>
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

        {currentPage === "all-tasks" && (
          <AllTasksView
            tasks={tasks}
            taskTypes={taskTypes}
            subjects={subjects}
            semesters={semesters}
            onSelectTask={(task) => setSelectedDate(task.due_date)}
          />
        )}

        {currentPage === "schedule" && (
          <div style={{ maxWidth: 1500, margin: "0 auto" }}>
            <SemesterSelector
              semesters={semesters}
              selectedId={scheduleSemesterId}
              onSelect={setScheduleSemesterId}
              onCreate={(name) => handleCreateSemester(name, "schedule")}
            />

            {semesters.length === 0 ? (
              <p style={{ opacity: 0.6, textAlign: "center", marginTop: 40 }}>
                No hay horarios creados. Crea uno con el botón "+ Semestre" de arriba.
              </p>
            ) : !scheduleSemesterId ? (
              <p style={{ opacity: 0.6, textAlign: "center", marginTop: 40 }}>
                No se ha seleccionado un horario.
              </p>
            ) : (
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: 500 }}>
                  <ScheduleView
                    slots={scheduleSlots.filter((slot) => {
                      const subj = subjects.find((s) => s.id === slot.subject_id);
                      return subj?.semester_id === scheduleSemesterId;
                    })}
                    subjects={subjects.filter((s) => s.semester_id === scheduleSemesterId)}
                    onCellClick={(day, hour) => setPickerCell({ day, hour })}
                  />
                </div>
                <SubjectsManager
                  subjects={subjects.filter((s) => s.semester_id === scheduleSemesterId)}
                  onToggleEnabled={handleToggleSubjectEnabled}
                  onDelete={handleDeleteSubject}
                />
              </div>
            )}
          </div>
        )}

        {currentPage === "grades" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2>Calificaciones</h2>
            <SemesterSelector
              semesters={semesters}
              selectedId={gradesSemesterId}
              onSelect={setGradesSemesterId}
              onCreate={(name) => handleCreateSemester(name, "grades")}
            />
            <GradesView
              subjects={subjects.filter((s) => s.semester_id === gradesSemesterId)}
              taskTypes={taskTypes}
              tasks={tasks}
              rubrics={rubrics}
              onAddRubric={handleAddRubric}
              onUpdateManualValue={handleUpdateManualValue}
              onDeleteRubric={handleDeleteRubric}
            />
          </div>
        )}
        
        {currentPage === "settings" && (
          <SettingsView currentTheme={user.theme} onThemeChange={handleThemeChange} />
        )}

        {currentPage === "books" && (
          <BooksView
            books={books}
            onAdd={handleAddBook}
            onUpdate={handleUpdateBook}
            onDelete={handleDeleteBook}
          />
        )}

        {selectedDate && (
          <TaskModal
            date={selectedDate}
            tasks={tasksForSelectedDate}
            taskTypes={taskTypes}
            subjects={subjects.filter((s) => s.enabled === 1)}
            onClose={() => setSelectedDate(null)}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
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