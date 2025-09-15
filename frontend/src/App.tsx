import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import PlanosPage from './pages/PlanosPageWeb'; 
import PagamentoPage from './pages/PagamentoPageWeb';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/planos" element={<PlanosPage />} />
      <Route path="/pagamento" element={<PagamentoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;