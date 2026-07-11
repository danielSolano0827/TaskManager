import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await Database.load("sqlite:tasks.db");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS task_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(30) NOT NULL UNIQUE,
        base_points INTEGER NOT NULL
      )
    `);

    await db.execute(`
      INSERT OR IGNORE INTO task_types (name, base_points) VALUES
        ('lectura', 10),
        ('quiz', 20),
        ('tarea', 30),
        ('examen', 50),
        ('proyecto', 80),
        ('proyecto_final', 150)
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        rank VARCHAR(30) DEFAULT 'Vagazo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
      AFTER UPDATE ON users
      BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_type_id INTEGER NOT NULL,
        title VARCHAR(150) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        grade REAL,
        points_earned INTEGER DEFAULT 0,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (task_type_id) REFERENCES task_types(id)
      )
    `);

    await db.execute(`
      CREATE TRIGGER IF NOT EXISTS trg_tasks_updated_at
      AFTER UPDATE ON tasks
      BEGIN
        UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
  }
  return db;
}