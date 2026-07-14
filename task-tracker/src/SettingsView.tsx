import { useState, useEffect } from "react";
import { setFullscreen, setMaximized, isFullscreen, isMaximized } from "./windowControls";

function SettingsView() {
  const [fullscreen, setFullscreenState] = useState(false);
  const [maximized, setMaximizedState] = useState(false);

  useEffect(() => {
    (async () => {
      setFullscreenState(await isFullscreen());
      setMaximizedState(await isMaximized());
    })();
  }, []);

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
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Configuración</h2>

      <div
        style={{
          background: "#16263d",
          border: "1px solid #2a4a6b",
          borderRadius: 10,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 500 }}>Pantalla completa</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Oculta bordes y barra de tareas</div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
            <input
              type="checkbox"
              checked={fullscreen}
              onChange={(e) => handleFullscreenToggle(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: fullscreen ? "#4f9eff" : "#2a4a6b",
                borderRadius: 24,
                transition: "0.2s",
                cursor: "pointer",
              }}
              onClick={() => handleFullscreenToggle(!fullscreen)}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: fullscreen ? 23 : 3,
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 500 }}>Ventana maximizada</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Ocupa toda la pantalla con bordes normales</div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
            <input
              type="checkbox"
              checked={maximized}
              onChange={(e) => handleMaximizedToggle(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: maximized ? "#4f9eff" : "#2a4a6b",
                borderRadius: 24,
                transition: "0.2s",
                cursor: "pointer",
              }}
              onClick={() => handleMaximizedToggle(!maximized)}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: maximized ? 23 : 3,
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
      </div>
    </div>
  );
}

export default SettingsView;