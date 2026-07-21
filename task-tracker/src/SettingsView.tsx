import { useState, useEffect, ReactNode } from "react";
import ThemeSelector from "./ThemeOption";
import { setFullscreen, setMaximized, isFullscreen, isMaximized } from "./windowControls";
import { enableAutostart, disableAutostart, isAutostartEnabled } from "./autostart";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{description}</div>
      </div>
      <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          onClick={() => onChange(!checked)}
          style={{
            position: "absolute",
            inset: 0,
            background: checked ? "var(--accent)" : "var(--border)",
            borderRadius: 24,
            transition: "0.2s",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: checked ? 23 : 3,
              width: 18,
              height: 18,
              background: "white",
              borderRadius: "50%",
              transition: "0.2s",
            }}
          />
        </span>
      </label>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 14, opacity: 0.6, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, textAlign: "left" }}>
        {title}
      </h3>
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "4px 16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid var(--border)" }} />;
}

interface SettingsViewProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

function SettingsView({ currentTheme, onThemeChange }: SettingsViewProps) {
  const [fullscreen, setFullscreenState] = useState(false);
  const [maximized, setMaximizedState] = useState(false);
  const [autostart, setAutostartState] = useState(false);

  useEffect(() => {
    (async () => {
      setFullscreenState(await isFullscreen());
      setMaximizedState(await isMaximized());
      setAutostartState(await isAutostartEnabled());
    })();
  }, []);

  async function handleAutostartToggle(checked: boolean) {
    if (checked) {
      await enableAutostart();
    } else {
      await disableAutostart();
    }
    setAutostartState(checked);
  }

  async function handleFullscreenToggle(checked: boolean) {
    await setFullscreen(checked);
    setFullscreenState(checked);
    if (checked) setMaximizedState(false);
  }

  async function handleMaximizedToggle(checked: boolean) {
    await setMaximized(checked);
    setMaximizedState(checked);
    if (checked) setFullscreenState(false);
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 24 }}>Configuración</h2>

      <SettingsSection title="Apariencia">
        <div style={{ padding: "12px 0" }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Tema de color</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Elige la paleta de colores de la app</div>
          <ThemeSelector current={currentTheme} onSelect={onThemeChange} />
        </div>
      </SettingsSection>

      <SettingsSection title="Ventana">
        <ToggleRow
          label="Pantalla completa"
          description="Oculta bordes y barra de tareas"
          checked={fullscreen}
          onChange={handleFullscreenToggle}
        />
        <Divider />
        <ToggleRow
          label="Ventana maximizada"
          description="Ocupa toda la pantalla con bordes normales"
          checked={maximized}
          onChange={handleMaximizedToggle}
        />
        <Divider />
        <ToggleRow
          label="Iniciar con Windows"
          description="Abre la app automáticamente al encender la PC"
          checked={autostart}
          onChange={handleAutostartToggle}
        />
      </SettingsSection>
    </div>
  );
}

export default SettingsView;