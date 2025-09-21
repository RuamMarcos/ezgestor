import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import PlanosPage from './pages/PlanosPageWeb';
import PagamentoPage from './pages/PagamentoPageWeb';
import Login from "./pages/Login";'1'
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />}/>
      <Route path="/planos" element={<PlanosPage />} />
      <Route path="/pagamento" element={<PagamentoPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/plans" element={<PlanosPage />} />
      <Route path="/payment" element={<PagamentoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;