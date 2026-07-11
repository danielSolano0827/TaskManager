import { useState, SyntheticEvent, FormEvent } from "react";
import { login, register, User } from "./auth";

interface AuthProps {
  onAuthenticated: (user: User) => void;
}

function AuthForm({ onAuthenticated }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user =
        mode === "login"
          ? await login(username, password)
          : await register(username, password);
      onAuthenticated(user);
    } catch (err) {
      console.error("Error completo:", err);
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 350, margin: "80px auto", padding: 20 }}>
      <h1>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          required
          style={{ padding: 8 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          style={{ padding: 8 }}
        />

        {error && <p style={{ color: "tomato", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Registrarse"}
        </button>
      </form>

      <p style={{ marginTop: 15 }}>
        {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
        >
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;