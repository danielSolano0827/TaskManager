interface SidebarProps {
  username: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📅" },
];

function Sidebar({ username, currentPage, onNavigate, onLogout }: SidebarProps) {
  return (
    <div
      style={{
        width: 200,
        minHeight: "100vh",
        background: "#0b1522",
        borderRight: "1px solid #2a4a6b",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: 24, padding: "0 8px" }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{username}</div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => (
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
              background: currentPage === item.id ? "#1e3a5f" : "transparent",
              color: "#e8f0ff",
              fontWeight: currentPage === item.id ? 600 : 400,
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          border: "1px solid #2a4a6b",
          borderRadius: 8,
          cursor: "pointer",
          background: "transparent",
          color: "#e8f0ff",
        }}
      >
        <span>🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
}

export default Sidebar;