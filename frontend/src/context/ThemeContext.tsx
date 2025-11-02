import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMyPreferences, updateMyPreferences } from '../services/userService';
import type { ThemeSetting } from '../services/userService';
import { useAuth } from './AuthContext';

type ThemeContextType = {
  themeSetting: ThemeSetting; // server-set or 'system'
  isDark: boolean; // resolved
  previewTheme: ThemeSetting | null;
  setPreview: (t: ThemeSetting | null) => void;
  applyTheme: (t: ThemeSetting) => Promise<void>;
  cancelPreview: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPrefersDark(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyDomTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>('system');
  const [previewTheme, setPreviewTheme] = useState<ThemeSetting | null>(null);
  const mediaQuery = useRef<MediaQueryList | null>(null);
  const pollingRef = useRef<number | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  const resolvedDark = useMemo(() => {
    const candidate = previewTheme ?? themeSetting;
    if (candidate === 'system') return getSystemPrefersDark();
    return candidate === 'dark';
  }, [themeSetting, previewTheme]);

  useEffect(() => {
    applyDomTheme(resolvedDark);
  }, [resolvedDark]);

  // Load from server on login and start polling
  useEffect(() => {
    if (!user) {
      // Clear polling when user logs out
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
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

    //pool every 8192 milliseconds
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
    pollingRef.current = window.setInterval(poll, 8192);

    return () => {
      cancelled = true;
      clearTimeout(initialLoadTimer);
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [user]);

  // Listen to system theme changes when on 'system' or preview = 'system'
  useEffect(() => {
    const handler = () => {
      applyDomTheme(getSystemPrefersDark());
    };
    mediaQuery.current = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.current.addEventListener?.('change', handler as any);
    return () => mediaQuery.current?.removeEventListener?.('change', handler as any);
  }, []);

  // Cross-tab immediate sync
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    broadcastRef.current = new BroadcastChannel('theme-sync');
    const ch = broadcastRef.current;
    ch.onmessage = (e) => {
      if (e?.data?.type === 'theme-update' && e.data.theme) {
        setThemeSetting(e.data.theme as ThemeSetting);
      }
    };
    return () => ch.close();
  }, []);

  const setPreview = useCallback((t: ThemeSetting | null) => {
    setPreviewTheme(t);
  }, []);

  const cancelPreview = useCallback(() => {
    setPreviewTheme(null);
  }, []);

  const applyTheme = useCallback(async (t: ThemeSetting) => {
    setPreviewTheme(null);
    setThemeSetting(t);
    try {
      await updateMyPreferences(t);
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'theme-update', theme: t });
      }
    } catch {}
  }, []);

  const value = useMemo(() => ({
    themeSetting,
    isDark: resolvedDark,
    previewTheme,
    setPreview,
    applyTheme,
    cancelPreview,
  }), [themeSetting, resolvedDark, previewTheme, setPreview, applyTheme, cancelPreview]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}


