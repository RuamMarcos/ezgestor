import { useState, useEffect, useCallback } from 'react';
import TransactionsTable from '../components/financials/TransactionsTable';
import StatCard from '../components/StatCard';
import FinancialChart from '../components/financials/FinancialChart';
import { getLancamentos, getFinancialStats, getLancamentoCategorias } from '../services/financialService';
import type { LancamentoFinanceiro, FinancialStats } from '../services/financialService';
import FinancialsHeader from '../components/financials/FinancialsHeader';
import FinancialsPagination from '../components/financials/FinancialsPagination';

function FinancialsPage() {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lancamentosLoading, setLancamentosLoading] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // 2. Estados para a paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 3. Atualizar a função de busca
  const fetchLancamentos = useCallback(async (page: number, search: string, categoria: string, tipo: string) => {
    try {
      setLancamentosLoading(true);
      const params = {
        page,
        ...(search.trim() && { search: search.trim() }),
        ...(categoria && { categoria }),
        ...(tipo && { tipo })
      };
      const data = await getLancamentos(params);
      setLancamentos(data.results);
      // Calcula o total de páginas com base no total de itens e no limite por página (10)
      setTotalPages(Math.ceil(data.count / 10)); 
    } catch (error) {
      console.error("Erro ao buscar lançamentos:", error);
      alert("Não foi possível carregar o extrato.");
    } finally {
      setLancamentosLoading(false);
    }
  }, []); 

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setInitialLoading(true);
        const [statsData, categoriesData] = await Promise.all([
          getFinancialStats(),
          getLancamentoCategorias()
        ]);
        setStats(statsData);
        setCategories(categoriesData);
        
        // Carregar lançamentos iniciais
        await fetchLancamentos(1, '', '', '');
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    initialFetch();
  }, [fetchLancamentos]);

  // Debounce para pesquisa
 useEffect(() => {
    const timer = setTimeout(() => {
      // Sempre que um filtro muda, a busca é feita na primeira página
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchLancamentos(1, searchTerm, selectedCategory, selectedType);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedType]);

  useEffect(() => {
    fetchLancamentos(currentPage, searchTerm, selectedCategory, selectedType);
  }, [currentPage, fetchLancamentos]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Fluxo de Caixa</h1>
      </div>

      {initialLoading ? (
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
      </div>

      <FinancialsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        categories={categories}
        onAddTransaction={() => { /* Lógica para abrir modal aqui */ }}
      />

      {lancamentosLoading ? (
        <p>Carregando extrato...</p>
      ) : (
        <>
          <TransactionsTable lancamentos={lancamentos} />
          {/* 6. Adicionar o componente de paginação */}
          <FinancialsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => handlePageChange(currentPage - 1)}
            onNextPage={() => handlePageChange(currentPage + 1)}
            onFirstPage={() => handlePageChange(1)}
            onLastPage={() => handlePageChange(totalPages)}
          />
        </>
      )}
    </div>
  );
}

export default FinancialsPage;