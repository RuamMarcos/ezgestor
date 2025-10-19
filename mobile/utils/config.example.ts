// Optional local override for API host during development.
// Copy this file to `config.ts` and set the IP of your backend machine.
// It will be used only if EXPO_PUBLIC_API_* env vars are not set and auto-detection fails.

export function getDevIp(): string | null {
  // e.g., return "192.168.0.10";
  return null;
}
