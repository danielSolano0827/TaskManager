import bcrypt from "bcryptjs";
import { getDb } from "./db";

export interface User {
  id: number;
  username: string;
  points: number;
  level: number;
  rank: string;
  habit_points: number;
  habit_level: number;
  habit_rank: string;
  theme: string;
}

export async function register(username: string, password: string): Promise<User> {
  const db = await getDb();

  const existing = await db.select<User[]>(
    "SELECT id FROM users WHERE username = $1",
    [username]
  );
  if (existing.length > 0) {
    throw new Error("Ese nombre de usuario ya existe");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.execute(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
    [username, passwordHash]
  );

  const [user] = await db.select<User[]>(
    "SELECT id, username, points, level, rank, theme, habit_points, habit_level, habit_rank FROM users WHERE username = $1",
    [username]
  );
  return user;
}

export async function login(username: string, password: string): Promise<User> {
  const db = await getDb();

  const rows = await db.select<(User & { password_hash: string })[]>(
    "SELECT id, username, password_hash, points, level, rank, theme, habit_points, habit_level, habit_rank FROM users WHERE username = $1",
    [username]
  );

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) {
    throw new Error("Contraseña incorrecta");
  }

  const { password_hash, ...user } = rows[0];
  return user;
}