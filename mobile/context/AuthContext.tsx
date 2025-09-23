import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import api from '../utils/api';
import { Platform } from 'react-native';

// --- Funções de armazenamento multiplataforma ---
const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};
// -----------------------------------------

interface AuthContextType {
  user: any;
  loading: boolean;
  hasActiveSubscription: boolean;
  login: (email: string, password: string) => Promise<{ hasActiveSubscription: boolean }>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const accessToken = await storage.getItem('access'); // Usa o storage multiplataforma
        if (accessToken) {
          const decodedToken: any = jwtDecode(accessToken);
          if (decodedToken.exp * 1000 > Date.now()) {
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setUser(decodedToken);
            setHasActiveSubscription(decodedToken.has_active_subscription); // Set subscription status
          } else {
            await logout();
          }
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/accounts/token/', { email, password });
      const { access, refresh } = response.data;

      // CORREÇÃO: Usar o storage multiplataforma em vez do SecureStore direto
      await storage.setItem('access', access);
      await storage.setItem('refresh', refresh);

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      const decodedToken: any = jwtDecode(access);
      setUser(decodedToken);
      setHasActiveSubscription(decodedToken.has_active_subscription); // Set subscription status

      return { hasActiveSubscription: decodedToken.has_active_subscription };
    } catch (error) {
      console.error("Erro no login do contexto:", error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      await api.post("/accounts/register/", data);
      await login(data.admin_email, data.admin_password);
    } catch (error) {
      console.error("Falha no registro ou login automático:", error);
      throw error;
    }
  };

  const logout = async () => {
    await storage.deleteItem('access'); // Usa o storage multiplataforma
    await storage.deleteItem('refresh'); // Usa o storage multiplataforma
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setHasActiveSubscription(false); // Reset subscription status
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasActiveSubscription, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};