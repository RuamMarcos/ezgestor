// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './layouts/DashboardLayout';
import SettingsLayout from './layouts/SettingsLayout';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import PlansPage from './pages/PlansPage';
import PaymentPage from './pages/PaymentPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import SalesPage from './pages/SalesPage';
import FinancialsPage from './pages/FinancialsPage';
import LandingPage from './pages/LandingPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import TeamManagementPage from './pages/TeamManagementPage';
import LogsPage from './pages/LogsPage';

import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/payment" element={<PaymentPage />} />

            {/* Rotas Protegidas (Dashboard) */}
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
              />
              <Route
                path="/stock"
                element={<ProtectedRoute><StockPage /></ProtectedRoute>}
              />
              <Route
                path="/sales"
                element={<ProtectedRoute><SalesPage /></ProtectedRoute>}
              />
              <Route
                path="/financials"
                element={<ProtectedRoute><FinancialsPage /></ProtectedRoute>}
              />
            </Route>

            {/* Rotas de Configurações */}
            <Route element={<SettingsLayout />}>
              <Route
                path="/settings/company"
                element={<ProtectedRoute><CompanyProfilePage /></ProtectedRoute>}
              />
              <Route element={<AdminProtectedRoute />}>
                <Route
                  path="/settings/team"
                  element={<TeamManagementPage />}
                />
              </Route>
              {/* V-- 2. ADICIONAR A NOVA ROTA PROTEGIDA --V */}
              <Route element={<AdminProtectedRoute />}>
                <Route
                  path="/settings/logs"
                  element={<LogsPage />}
                />
              </Route>
              {/* ^-- FIM DA ADIÇÃO --^ */}
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;