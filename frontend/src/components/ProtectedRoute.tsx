import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Enquanto verifica a autenticação, mostra uma tela de carregamento
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza o componente filho
  return <>{children}</>;
};

export default ProtectedRoute;