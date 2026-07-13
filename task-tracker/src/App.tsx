import { useState, useEffect } from "react";
import { getDb } from "./db";
import AuthForm from "./AuthForm";
import Sidebar from "./Sidebar";
import CalendarView from "./CalendarView";
import TaskModal from "./TaskModal";
import CompleteTaskModal from "./CompleteTaskModal";
import UpcomingTasksList from "./UpcomingTasksList";
import { User } from "./auth";
import "./App.css";

interface Task {
  id: number;
  title: string;
  status: "pending" | "done";
  task_type_id: number;
  grade: number | null;
  points_earned: number;
  due_date: string;
}

interface TaskType {
  id: number;
  name: string;
  base_points: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  async function loadTaskTypes() {
    const db = await getDb();
    const result = await db.select<TaskType[]>("SELECT * FROM task_types");
    setTaskTypes(result);
  }

  async function loadTasks(userId: number) {
    const db = await getDb();
    const result = await db.select<Task[]>(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    setTasks(result);
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
    }
  }, [user?.id]);

  function handleLogout() {
    setUser(null);
    setTasks([]);
    setSelectedDate(null);
    setTaskToComplete(null);
    setCurrentPage("dashboard");
  }

  async function handleAddTask(title: string, taskTypeId: number) {
    if (!user || !selectedDate) return;
    const db = await getDb();
    await db.execute(
      "INSERT INTO tasks (user_id, task_type_id, title, due_date) VALUES ($1, $2, $3, $4)",
      [user.id, taskTypeId, title, selectedDate]
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
    const newRank =
      newLevel >= 21 ? "Maestro" :
      newLevel >= 11 ? "Experto" :
      newLevel >= 6 ? "Competente" :
      newLevel >= 3 ? "Aprendiz" : "Novato";

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

  if (!user) {
    return <AuthForm onAuthenticated={setUser} />;
  }

  const tasksByDate: Record<string, number> = {};
  for (const t of tasks) {
    tasksByDate[t.due_date] = (tasksByDate[t.due_date] ?? 0) + 1;
  }

  const tasksForSelectedDate = tasks.filter((t) => t.due_date === selectedDate);
  const typeForCompleting = taskToComplete
    ? taskTypes.find((t) => t.id === taskToComplete.task_type_id)
    : null;

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
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 24 }}>Hola, {user.username}</h1>
              <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: 14 }}>
                Sigue mejorando.
              </p>
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
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e8f0ff", whiteSpace: "nowrap" }}>{user.rank}</div>
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
              <UpcomingTasksList tasks={tasks} taskTypes={taskTypes} onSelectTask={setSelectedDate} />
            </div>
          </div>
        )}

        {selectedDate && (
          <TaskModal
            date={selectedDate}
            tasks={tasksForSelectedDate}
            taskTypes={taskTypes}
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
      </div>
    </div>
  );
}

export default App;