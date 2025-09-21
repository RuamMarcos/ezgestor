import Constants from 'expo-constants';

type DeviceHostResolution = {
  host: string | null;
  scheme: 'http' | 'https';
  port: number | null;
};

function resolveDevHost(): DeviceHostResolution {
  try {
    const expoConfig = (Constants as any)?.expoConfig ?? (Constants as any)?.manifest2 ?? {};
    // Expo Router SDK 49/50+: expoConfig.hostUri or debuggerHost are common
    const hostUri: string | undefined = expoConfig.hostUri || expoConfig.debuggerHost || (Constants as any)?.manifest?.debuggerHost;
    if (hostUri && typeof hostUri === 'string') {
      const host = hostUri.split(':')[0];
      // Default to 8000 for the backend (mapped by Docker Desktop)
      return { host, scheme: 'http', port: 8000 };
    }
  } catch {}
  return { host: null, scheme: 'http', port: 8000 };
}

export function getApiBaseUrl(): string {
  // Highest priority: explicit public URL (prod or tunnel)
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  // Web environment
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const port = 8000; // Docker Desktop mapping
    return `http://${host}:${port}`;
  }

  // Native dev: derive from Expo dev server host
  const { host, scheme, port } = resolveDevHost();
  if (host) {
    return `${scheme}://${host}:${port ?? 8000}`;
  }

  // Fallback to localhost (works with ADB reverse in emulator)
  return 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();

