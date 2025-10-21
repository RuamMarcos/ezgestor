import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  if (user?.nivel_acesso !== 'administrador') {
    return <Navigate to="/vendas" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;