import { getCurrentWindow } from "@tauri-apps/api/window";

export async function exitApp() {
  const win = getCurrentWindow();
  await win.close();
}

export async function setFullscreen(enabled: boolean) {
  const win = getCurrentWindow();
  await win.setFullscreen(enabled);
}

export async function setMaximized(enabled: boolean) {
  const win = getCurrentWindow();
  if (enabled) {
    await win.maximize();
  } else {
    await win.unmaximize();
  }
}

export async function isFullscreen(): Promise<boolean> {
  const win = getCurrentWindow();
  return await win.isFullscreen();
}

export async function isMaximized(): Promise<boolean> {
  const win = getCurrentWindow();
  return await win.isMaximized();
}