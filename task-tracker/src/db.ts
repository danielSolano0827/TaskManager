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
        ('Lectura', 10),
        ('Quiz', 20),
        ('Tarea', 30),
        ('Examen', 50),
        ('Proyecto', 80),
        ('Proyecto Final', 150),
        ('Examen Final', 150)
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
      CREATE TABLE IF NOT EXISTS semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        semester_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) DEFAULT '#4f9eff',
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (semester_id) REFERENCES semesters(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS grading_rubrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        weight_percent REAL NOT NULL,
        type VARCHAR(10) NOT NULL DEFAULT 'manual', -- 'manual' | 'tasks'
        task_type_id INTEGER,
        manual_value REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (task_type_id) REFERENCES task_types(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS schedule_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL, -- 0=Domingo ... 6=Sábado
        hour INTEGER NOT NULL,        -- 7 a 19
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_type_id INTEGER NOT NULL,
        subject_id INTEGER,
        title VARCHAR(150) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(10) DEFAULT 'media',
        grade REAL,
        points_earned INTEGER DEFAULT 0,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (task_type_id) REFERENCES task_types(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
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