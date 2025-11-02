import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, AppState } from 'react-native';
import { getMyPreferences, updateMyPreferences } from '../services/UserService';
import type { ThemeSetting } from '../services/UserService';
import { useAuth } from './AuthContext';

export interface ThemeColors {
  headerBlue: string;
  background: string;
  darkText: string;
  grayText: string;
  lightGray: string;
  card: string;
  border: string;
}

interface ThemeContextType {
  themeSetting: ThemeSetting;
  isDark: boolean;
  previewTheme: ThemeSetting | null;
  setPreview: (t: ThemeSetting | null) => void;
  applyTheme: (t: ThemeSetting) => Promise<void>;
  cancelPreview: () => void;
  colors: ThemeColors;
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

  const colors = useMemo<ThemeColors>(() => {
    if (isDark) {
      return {
        headerBlue: '#93C5FD',
        background: '#0F172A',
        darkText: '#E5E7EB',
        grayText: '#9CA3AF',
        lightGray: '#1F2937',
        card: '#111827',
        border: '#374151',
      };
    }
    return {
      headerBlue: '#4A55E1',
      background: '#F4F7FC',
      darkText: '#343A40',
      grayText: '#6C757D',
      lightGray: '#E9ECEF',
      card: '#FFFFFF',
      border: '#E5E7EB',
    };
  }, [isDark]);

  // Load from backend and start polling when authenticated
  useEffect(() => {
    if (!user) {
      // Clear polling when user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    let cancelled = false;

    // Delay initial load to ensure user is fully authenticated
    const initialLoadTimer = setTimeout(async () => {
      try {
        const pref = await getMyPreferences();
        if (!cancelled) setThemeSetting(pref.theme);
      } catch (error) {
        // Silently fail - user might not have preferences yet
        console.debug('Could not load theme preferences:', error);
      }
    }, 500); // Wait 500ms after login

    const poll = async () => {
      try {
        const pref = await getMyPreferences();
        if (!cancelled) {
          setThemeSetting((old) => (old !== pref.theme ? pref.theme : old));
        }
      } catch (error) {
        // Silently fail - avoid spamming console
        console.debug('Could not poll theme preferences:', error);
      }
    };

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(poll, 8192) as unknown as number;
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
      clearTimeout(initialLoadTimer);
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

  const value = useMemo(() => ({ themeSetting, isDark, previewTheme, setPreview, applyTheme, cancelPreview, colors }), [themeSetting, isDark, previewTheme, setPreview, applyTheme, cancelPreview, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
