import { useState, FormEvent } from "react";
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 30% 20%, #1e3a5f 0%, #0f1b2d 60%)",
      }}
    >
      <div
        style={{
          background: "#16263d",
          border: "1px solid #2a4a6b",
          borderRadius: 16,
          padding: "48px 40px",
          width: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{ width: 120, height: 90, marginBottom: 16 }}
        />

        <h1 style={{ margin: 0, fontSize: 26 }}>Task Tracker</h1>
        <p style={{ marginTop: 6, marginBottom: 32, opacity: 0.6, fontSize: 14 }}>
          {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta para empezar"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            required
            style={{ padding: 12, fontSize: 15 }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            style={{ padding: 12, fontSize: 15 }}
          />

          {error && <p style={{ color: "#ff6b6b", margin: 0, fontSize: 13 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 12,
              fontSize: 15,
              background: "#4f9eff",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Registrarse"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 14 }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            style={{ background: "none", border: "none", color: "#4f9eff", textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: 14 }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;