import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api"; // 👈 usar a instância configurada

interface AuthContextType {
  user: any;
  loading: boolean; 
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      const accessToken = localStorage.getItem("access");
      if (accessToken) {
        try {
          const decodedToken: any = jwtDecode(accessToken);
          const isExpired = decodedToken.exp * 1000 < Date.now();
          if (!isExpired) {
            setUser(decodedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token inválido:", error);
          logout();
        }
      }
      setLoading(false); 
    };

    checkUserStatus();

    // Configura o interceptor para adicionar o token a cada requisição
    const interceptor = api.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("access");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Função de limpeza para remover o interceptor
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/accounts/token/", { email, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    const decodedToken: any = jwtDecode(res.data.access);
    setUser(decodedToken); // Define o usuário com os dados do token
  };

  const register = async (data: any) => {
    await api.post("/accounts/register/", data); // 👈 aqui
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
