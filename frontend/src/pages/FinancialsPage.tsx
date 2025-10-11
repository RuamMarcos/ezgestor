import { useState, useEffect } from 'react';
import TransactionsTable from '../components/financials/TransactionsTable';
import StatCard from '../components/StatCard';
import FinancialChart from '../components/financials/FinancialChart'; // 1. Importar o gráfico
import { getLancamentos, getFinancialStats } from '../services/financialService';
import type { LancamentoFinanceiro, FinancialStats } from '../services/financialService';

function FinancialsPage() {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lancamentosData, statsData] = await Promise.all([
          getLancamentos(),
          getFinancialStats()
        ]);
        setLancamentos(lancamentosData);
        setStats(statsData);
      } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
        alert("Não foi possível carregar os dados da página.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Fluxo de Caixa</h1>
      </div>

      {loading ? (
        <p>Carregando estatísticas...</p>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Receita Total (Entradas)"
            value={formatCurrency(stats.total_entradas)}
            gradient="bg-gradient-to-r from-green-400 to-blue-400"
          />
          <StatCard
            title="Despesas Totais (Saídas)"
            value={formatCurrency(stats.total_saidas)}
            gradient="bg-gradient-to-r from-yellow-400 to-orange-400"
          />
          <StatCard
            title="Saldo Atual"
            value={formatCurrency(stats.saldo_atual)}
            gradient="bg-gradient-to-r from-purple-500 to-indigo-500"
          />
        </div>
      )}

      <FinancialChart />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Histórico de Transações</h2>
        <button
          className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow"
        >
          Novo Lançamento
        </button>
      </div>

      {loading ? (
        <p>Carregando extrato...</p>
      ) : (
        <TransactionsTable lancamentos={lancamentos} />
      )}
    </div>
  );
}

export default FinancialsPage;