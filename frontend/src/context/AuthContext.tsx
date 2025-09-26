import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api"; 

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ hasActiveSubscription: boolean }>; 
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
    const response = await api.post('/accounts/token/', { email, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    const decodedToken: any = jwtDecode(access);
    setUser(decodedToken);
    
    // Retorna o status da assinatura do payload do token
    return { hasActiveSubscription: decodedToken.has_active_subscription };
  };

  const register = async (data: any) => {
    try {
      // Mantém a chamada de registro como está
      await api.post("/accounts/register/", data);

      // Após o registro bem-sucedido, faz o login automaticamente
      await login(data.admin_email, data.admin_password);

    } catch (error) {
      console.error("Falha no registro ou login automático:", error);
      // Re-lança o erro para que a página de registro possa tratá-lo
      throw error;
    }
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
