import { useState, useEffect, FormEvent } from "react";
import { getDb } from "./db";
import AuthForm from "./AuthForm";
import { User } from "./auth";
import "./App.css";

interface Task {
  id: number;
  title: string;
  status: "pending" | "done";
  task_type_id: number;
  grade: number | null;
  points_earned: number;
}

interface TaskType {
  id: number;
  name: string;
  base_points: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [title, setTitle] = useState("");
  const [taskTypeId, setTaskTypeId] = useState<number | null>(null);

  async function loadTaskTypes() {
    const db = await getDb();
    const result = await db.select<TaskType[]>("SELECT * FROM task_types");
    setTaskTypes(result);
    if (result.length > 0) setTaskTypeId(result[0].id);
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

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !taskTypeId || !user) return;

    const db = await getDb();
    await db.execute(
      "INSERT INTO tasks (user_id, task_type_id, title) VALUES ($1, $2, $3)",
      [user.id, taskTypeId, title.trim()]
    );
    setTitle("");
    await loadTasks(user.id);
  }

  async function completeTask(taskId: number, taskTypeId: number, grade: number) {
    if (!user) return;
    const db = await getDb();

    const [type] = await db.select<TaskType[]>(
      "SELECT * FROM task_types WHERE id = $1",
      [taskTypeId]
    );
    const pointsEarned = Math.round(type.base_points * (grade / 100));

    await db.execute(
      "UPDATE tasks SET status = 'done', grade = $1, points_earned = $2 WHERE id = $3",
      [grade, pointsEarned, taskId]
    );

    const newPoints = user.points + pointsEarned;
    const newLevel = Math.floor(newPoints / 100) + 1;
    const newRank =
      newLevel >= 21 ? "Estas Volando" :
      newLevel >= 11 ? "Aplicado" :
      newLevel >= 6 ? "Normal" :
      newLevel >= 3 ? "Vago" : "Vagazo";

    await db.execute(
      "UPDATE users SET points = $1, level = $2, rank = $3 WHERE id = $4",
      [newPoints, newLevel, newRank, user.id]
    );

    await refreshUser(user.id);
    await loadTasks(user.id);
  }

  async function deleteTask(id: number) {
    if (!user) return;
    const db = await getDb();
    await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
    await loadTasks(user.id);
  }

  if (!user) {
    return <AuthForm onAuthenticated={setUser} />;
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>Hola, {user.username}</h1>
      <p>Nivel {user.level} — {user.rank} — {user.points} pts</p>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <select
          value={taskTypeId ?? ""}
          onChange={(e) => setTaskTypeId(Number(e.target.value))}
          style={{ padding: 8 }}
        >
          {taskTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.base_points} pts)
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Agregar</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
              borderBottom: "1px solid #333",
            }}
          >
            <span
              style={{
                flex: 1,
                textDecoration: task.status === "done" ? "line-through" : "none",
                opacity: task.status === "done" ? 0.6 : 1,
              }}
            >
              {task.title}
              {task.status === "done" && ` — ${task.grade}% (+${task.points_earned} pts)`}
            </span>

            {task.status === "pending" && (
              <button
                onClick={() => {
                  const grade = prompt("Calificación (0-100):");
                  if (grade !== null && !isNaN(Number(grade))) {
                    completeTask(task.id, task.task_type_id, Number(grade));
                  }
                }}
              >
                Completar
              </button>
            )}

            <button onClick={() => deleteTask(task.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p style={{ opacity: 0.6, marginTop: 20 }}>No hay tareas todavía.</p>
      )}
    </div>
  );
}

export default App;