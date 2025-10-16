import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import AddSaleModal from '../components/sales/AddSaleModal';
import api from '../api';

// Tipos para os dados do dashboard
interface Sale {
  id: number;
  clientName: string;
  description: string;
  value: number;
}

interface DashboardData {
  monthlyRevenue: number;
  salesCount: number;
  lowStockItems: number;
  estimatedProfit: number;
  recentSales: Sale[];
}

const emptyDashboardData: DashboardData = {
  monthlyRevenue: 0,
  salesCount: 0,
  lowStockItems: 0,
  estimatedProfit: 0,
  recentSales: [],
};

function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSaleAdded = () => {
    // Recarrega KPIs após nova venda
    fetchDashboard();
  };
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get('/financeiro/dashboard/');
      const d = resp.data || {};
      setData({
        monthlyRevenue: Number(d.monthlyRevenue ?? 0),
        salesCount: Number(d.salesCount ?? 0),
        lowStockItems: Number(d.lowStockItems ?? 0),
        estimatedProfit: Number(d.estimatedProfit ?? 0),
        recentSales: Array.isArray(d.recentSales) ? d.recentSales : [],
      });
    } catch (e: any) {
      setError('Não foi possível carregar os indicadores agora.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleGenerateReports = async () => {
    try {
      setDownloading(true);
      // Default period: current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

      const response = await api.get(`/relatorios/bundle/?start=${start}&end=${end}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorios_${start}_${end}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError('Não foi possível gerar os relatórios agora.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Geral</h2>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Receita Mensal" 
          value={loading ? '—' : formatCurrency(data.monthlyRevenue)}
          gradient="bg-gradient-to-r from-orange-400 to-pink-400"
        />
        <StatCard 
          title="Vendas Este Mês" 
          value={loading ? '—' : data.salesCount.toString()}
          gradient="bg-gradient-to-r from-pink-300 to-orange-300"
        />
        <StatCard 
          title="Produtos em Estoque Baixo" 
          value={loading ? '—' : data.lowStockItems.toString()}
          gradient="bg-gradient-to-r from-purple-200 to-pink-200"
          textColor="text-gray-700"
        />
        <StatCard 
          title="Lucro Estimado" 
          value={loading ? '—' : formatCurrency(data.estimatedProfit)}
          gradient="bg-gradient-to-r from-cyan-400 to-blue-400"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas dos Últimos 7 Dias</h3>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl h-64 flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <div className="text-gray-800 text-lg font-medium">Gráfico de Vendas Diárias</div>
            <div className="text-gray-600 text-sm mt-2">Visualização em desenvolvimento</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
        >
          Nova Venda
        </button>
        <button onClick={handleGenerateReports} disabled={downloading} className={`bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {downloading ? 'Gerando…' : 'Gerar Relatórios'}
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg">
          Emitir NF-e
        </button>
      </div>

      <div className="mt-8 bg-white rounded-2xl p-6 hidden lg:block border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas Recentes</h3>
        <div className="space-y-3">
          {loading && (
            <div className="py-6 text-center text-gray-500">Carregando...</div>
          )}
          {!loading && data.recentSales.length === 0 && (
            <div className="py-6 text-center text-gray-500">Sem vendas recentes.</div>
          )}
          {!loading && data.recentSales.map((sale: any) => (
            <div key={sale.id} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">{sale.clientName}</p>
                <p className="text-sm text-gray-600">{sale.description}</p>
              </div>
              <p className="font-semibold text-gray-800">{formatCurrency(Number(sale.value || 0))}</p>
            </div>
          ))}
        </div>
      </div>

      <AddSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaleAdded={handleSaleAdded}
      />

    </div>
  );
}

export default DashboardPage;