import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, AppState } from 'react-native';
import { getMyPreferences, updateMyPreferences } from '../services/UserService';
import type { ThemeSetting } from '../services/UserService';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  themeSetting: ThemeSetting;
  isDark: boolean;
  previewTheme: ThemeSetting | null;
  setPreview: (t: ThemeSetting | null) => void;
  applyTheme: (t: ThemeSetting) => Promise<void>;
  cancelPreview: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function resolveDark(setting: ThemeSetting): boolean {
  if (setting === 'system') return Appearance.getColorScheme() === 'dark';
  return setting === 'dark';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>('system');
  const [previewTheme, setPreviewTheme] = useState<ThemeSetting | null>(null);
  const intervalRef = useRef<number | null>(null);

  const isDark = useMemo(() => resolveDark(previewTheme ?? themeSetting), [previewTheme, themeSetting]);

  // Load from backend and start polling when authenticated
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const pref = await getMyPreferences();
        if (!cancelled) setThemeSetting(pref.theme);
      } catch {}
    };
    load();

    const poll = async () => {
      try {
        const pref = await getMyPreferences();
        setThemeSetting((old) => (old !== pref.theme ? pref.theme : old));
      } catch {}
    };

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(poll, 15000) as unknown as number;
    };
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const appStateHandler = (state: string) => {
      if (state === 'active') startPolling(); else stopPolling();
    };

    const sub = AppState.addEventListener('change', appStateHandler);
    startPolling();

    return () => {
      cancelled = true;
      sub.remove();
      stopPolling();
    };
  }, [user]);

  // Listen to system theme changes
  useEffect(() => {
    const listener = ({ colorScheme }: { colorScheme: 'light' | 'dark' | null }) => {
      // Trigger re-computation
      setThemeSetting((s) => s);
    };
    const sub = Appearance.addChangeListener(listener as any);
    return () => sub.remove();
  }, []);

  const setPreview = useCallback((t: ThemeSetting | null) => setPreviewTheme(t), []);
  const cancelPreview = useCallback(() => setPreviewTheme(null), []);

  const applyTheme = useCallback(async (t: ThemeSetting) => {
    setPreviewTheme(null);
    setThemeSetting(t);
    try { await updateMyPreferences(t); } catch {}
  }, []);

  const value = useMemo(() => ({ themeSetting, isDark, previewTheme, setPreview, applyTheme, cancelPreview }), [themeSetting, isDark, previewTheme, setPreview, applyTheme, cancelPreview]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
