import { useState } from "react";
import { exitApp } from "./windowControls";
import ConfirmModal from "./ConfirmModal";

interface SidebarProps {
  username: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const NAV_GROUPS = [
  {
    label: "Tareas",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "♠️" },
      { id: "all-tasks", label: "Historial", icon: "♥️" },
      { id: "schedule", label: "Horario", icon: "♣️" },
      { id: "grades", label: "Calificaciones", icon: "♦️" },
    ],
  },
  {
    label: "Libros",
    items: [
      { id: "books", label: "Biblioteca", icon: "♟️" },
    ],
  },
  {
    label: "General",
    items: [
      { id: "settings", label: "Configuración", icon: "♥️" },
    ],
  },
];

function Sidebar({ username, currentPage, onNavigate, onLogout }: SidebarProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  async function handleConfirmExit() {
    await exitApp();
  }

  return (
    <div
      style={{
        width: 200,
        minHeight: "100vh",
        background: "var(--bg-sunken)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: 24, padding: "0 8px" }}>
        <div style={{ 
          border: "1px solid var(--border)", 
          borderRadius: 8,
          padding: "10px 0", 
          fontWeight: 600, 
          fontSize: 22, 
          textAlign: "center" }}>{username}</div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                opacity: 0.45,
                padding: "0 12px 6px",
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    background: currentPage === item.id ? "var(--bg-surface-alt)" : "transparent",
                    color: "var(--text)",
                    fontWeight: currentPage === item.id ? 600 : 400,
                    borderLeft: currentPage === item.id ? "3px solid var(--accent)" : "3px solid transparent",
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            cursor: "pointer",
            background: "transparent",
            color: "var(--text)",
          }}
        >
          <span>☄️</span>
          <span>Cerrar sesión</span>
        </button>

        <button
          onClick={() => setShowExitConfirm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            border: "1px solid #ff6b6b",
            borderRadius: 8,
            cursor: "pointer",
            background: "transparent",
            color: "#ff6b6b",
          }}
        >
          <span>⏻</span>
          <span>Salir</span>
        </button>
      </div>

      {showExitConfirm && (
        <ConfirmModal
          title="Salir de la aplicación"
          message="¿Seguro que quieres cerrar Task Tracker? Se cerrará por completo."
          confirmLabel="Salir"
          cancelLabel="Cancelar"
          danger
          onConfirm={handleConfirmExit}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}
    </div>
  );
}

export default Sidebar;