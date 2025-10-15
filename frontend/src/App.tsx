import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import PlansPage from './pages/PlansPage';
import PaymentPage from './pages/PaymentPage';
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout'; 
import StockPage from './pages/StockPage'; 
import SalesPage from './pages/SalesPage';
import FinancialsPage from './pages/FinancialsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Protected Routes with the new Layout */}
        <Route 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/vendas" element={<SalesPage />} />
          <Route path="/fluxo-de-caixa" element={<FinancialsPage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;