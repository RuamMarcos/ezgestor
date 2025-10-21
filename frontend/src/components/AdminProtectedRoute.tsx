import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute: React.FC = () => {
  const { user } = useAuth();

  if (user?.nivel_acesso !== 'administrador') {
    // Redireciona para o dashboard se não for admin
    return <Navigate to="/dashboard" replace />;
  }

  // Renderiza o conteúdo da rota (Outlet) se for admin
  return <Outlet />;
};

export default AdminProtectedRoute;