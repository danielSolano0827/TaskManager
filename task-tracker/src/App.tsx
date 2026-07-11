import { useState, useEffect, SyntheticEvent } from "react";
import { getDb } from "./db";
import "./App.css";

interface Task {
  id: number;
  title: string;
  status: "pending" | "done";
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  async function loadTasks() {
    const db = await getDb();
    const result = await db.select<Task[]>("SELECT * FROM tasks ORDER BY id DESC");
    setTasks(result);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    const db = await getDb();
    await db.execute("INSERT INTO tasks (title) VALUES ($1)", [title.trim()]);
    setTitle("");
    await loadTasks();
  }

  async function toggleTask(id: number, current: string) {
    const db = await getDb();
    const newStatus = current === "pending" ? "done" : "pending";
    await db.execute("UPDATE tasks SET status = $1 WHERE id = $2", [newStatus, id]);
    await loadTasks();
  }

  async function deleteTask(id: number) {
    const db = await getDb();
    await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
    await loadTasks();
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>Mis tareas</h1>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Agregar</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
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
            <input
              type="checkbox"
              checked={task.status === "done"}
              onChange={() => toggleTask(task.id, task.status)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: task.status === "done" ? "line-through" : "none",
                opacity: task.status === "done" ? 0.6 : 1,
              }}
            >
              {task.title}
            </span>
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