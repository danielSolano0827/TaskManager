import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

export async function enableAutostart() {
  await enable();
}

export async function disableAutostart() {
  await disable();
}

export async function isAutostartEnabled(): Promise<boolean> {
  return await isEnabled();
}