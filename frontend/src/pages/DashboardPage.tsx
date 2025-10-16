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
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('bundle');
  const [reportFormat, setReportFormat] = useState<'pdf'|'csv'>('pdf');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [vendedor, setVendedor] = useState<string>('');
  const [cliente, setCliente] = useState<string>('');
  const [produto, setProduto] = useState<string>('');
  const [gapDays, setGapDays] = useState<number>(30);
  const [leadTime, setLeadTime] = useState<number>(7);
  const [safety, setSafety] = useState<number>(3);
  const [baseDays, setBaseDays] = useState<number>(30);

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

  const openReportModal = () => {
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    setStartDate(s);
    setEndDate(e);
    setReportType('bundle');
    setReportFormat('pdf');
    setReportModalOpen(true);
  };

  const generateSelectedReport = async () => {
    try {
      setDownloading(true);
      const s = startDate;
      const e = endDate;
      let url = '';
      let filename = '';
      const fmt = reportFormat;
      const params: string[] = [];
      if (startDate) params.push(`start=${s}`);
      if (endDate) params.push(`end=${e}`);
      if (vendedor) params.push(`vendedor=${encodeURIComponent(vendedor)}`);
      if (cliente) params.push(`cliente=${encodeURIComponent(cliente)}`);
      if (produto) params.push(`produto=${encodeURIComponent(produto)}`);
  // CSV agora suportado por todos os relatórios no backend (bundle retorna ZIP contendo PDFs ou CSVs)
      const finalFmt = fmt;
      switch (reportType) {
        case 'executive':
          url = `/relatorios/executive-summary/?${params.join('&')}&format=${finalFmt}`;
          filename = `resumo_executivo_${s}_${e}.${finalFmt}`;
          break;
        case 'sales-period':
          url = `/relatorios/sales-period/?${params.join('&')}&format=${finalFmt}`;
          filename = `vendas_periodo_${s}_${e}.${finalFmt}`;
          break;
        case 'product-ranking':
          url = `/relatorios/product-ranking/?${params.join('&')}&format=${finalFmt}`;
          filename = `ranking_produtos_${s}_${e}.${finalFmt}`;
          break;
        case 'seller-performance':
          url = `/relatorios/seller-performance/?${params.join('&')}&format=${finalFmt}`;
          filename = `performance_vendedor_${s}_${e}.${finalFmt}`;
          break;
        case 'sales-by-customer':
          if (gapDays) params.push(`gap_days=${gapDays}`);
          url = `/relatorios/sales-by-customer/?${params.join('&')}&format=${finalFmt}`;
          filename = `vendas_cliente_${s}_${e}.${finalFmt}`;
          break;
        case 'stock-position':
          if (baseDays) params.push(`base_days=${baseDays}`);
          url = `/relatorios/stock-position/?${params.join('&')}&format=${finalFmt}`;
          filename = `posicao_estoque_${s}_${e}.${finalFmt}`;
          break;
        case 'replenishment':
          if (leadTime) params.push(`lead_time=${leadTime}`);
          if (safety) params.push(`safety=${safety}`);
          if (baseDays) params.push(`base_days=${baseDays}`);
          url = `/relatorios/replenishment-suggestion/?${params.join('&')}&format=${finalFmt}`;
          filename = `sugestao_compra_${s}_${e}.${finalFmt}`;
          break;
        case 'cashflow':
          url = `/relatorios/cashflow/?${params.join('&')}&format=${finalFmt}`;
          filename = `fluxo_caixa_${s}_${e}.${finalFmt}`;
          break;
        case 'kardex':
          url = `/relatorios/kardex/?${params.join('&')}&format=${finalFmt}`;
          filename = `kardex_${s}_${e}.${finalFmt}`;
          break;
        case 'dre':
          url = `/relatorios/dre-simplificada/?${params.join('&')}&format=${finalFmt}`;
          filename = `dre_${s}_${e}.${finalFmt}`;
          break;
        case 'bundle':
        default: {
          const base = params.length ? `${params.join('&')}&` : '';
          url = `/relatorios/bundle/?${base}format=${finalFmt}`;
          const suffix = finalFmt === 'csv' ? 'csv' : 'pdf';
          filename = `relatorios_${s}_${e}_${suffix}.zip`;
          break;
        }
      }

      const resp = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([resp.data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      setError('Não foi possível gerar o relatório agora.');
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
        <button onClick={openReportModal} disabled={downloading} className={`bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {downloading ? 'Gerando…' : 'Gerar Relatório(s)'}
        </button>
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Gerar Relatório</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tipo</label>
                <select value={reportType} onChange={(e)=>setReportType(e.target.value)} className="w-full border rounded-lg p-2">
                  <option value="bundle">Bundle (ZIP com todos)</option>
                  <option value="executive">Resumo Executivo</option>
                  <option value="sales-period">Vendas por Período</option>
                  <option value="product-ranking">Ranking de Produtos</option>
                  <option value="seller-performance">Performance por Vendedor</option>
                  <option value="sales-by-customer">Vendas por Clientes</option>
                  <option value="stock-position">Posição de Estoque</option>
                  <option value="replenishment">Sugestão de Compra</option>
                  <option value="cashflow">Fluxo de Caixa</option>
                  <option value="kardex">Kardex</option>
                  <option value="dre">DRE Simplificada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Formato</label>
                <select value={reportFormat} onChange={(e)=>setReportFormat(e.target.value as 'pdf'|'csv')} className="w-full border rounded-lg p-2">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">CSV disponível para todos os relatórios. Bundle gera um ZIP contendo arquivos no formato escolhido.</p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Vendedor (email ou id)</label>
                  <input type="text" value={vendedor} onChange={(e)=>setVendedor(e.target.value)} placeholder="opcional" className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Cliente</label>
                  <input type="text" value={cliente} onChange={(e)=>setCliente(e.target.value)} placeholder="opcional" className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Produto (nome ou id)</label>
                  <input type="text" value={produto} onChange={(e)=>setProduto(e.target.value)} placeholder="opcional" className="w-full border rounded-lg p-2" />
                </div>
              </div>
              {reportType === 'sales-by-customer' && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700 mb-1">Gap dias (recuperáveis)</label>
                  <input type="number" value={gapDays} onChange={(e)=>setGapDays(Number(e.target.value))} className="w-full border rounded-lg p-2" />
                </div>
              )}
              {reportType === 'replenishment' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Base (dias)</label>
                    <input type="number" value={baseDays} onChange={(e)=>setBaseDays(Number(e.target.value))} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Lead time (dias)</label>
                    <input type="number" value={leadTime} onChange={(e)=>setLeadTime(Number(e.target.value))} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Safety (dias)</label>
                    <input type="number" value={safety} onChange={(e)=>setSafety(Number(e.target.value))} className="w-full border rounded-lg p-2" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Início</label>
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Fim</label>
                <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full border rounded-lg p-2" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>setReportModalOpen(false)} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button onClick={generateSelectedReport} disabled={downloading} className="px-4 py-2 rounded-lg bg-green-600 text-white">
                {downloading ? 'Gerando…' : 'Gerar'}
              </button>
            </div>
          </div>
        </div>
      )}
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