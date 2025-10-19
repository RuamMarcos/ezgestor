import React, { useState, useEffect } from 'react';
import api from '../api';
import SalesHeader from '../components/sales/SalesHeader';
import SalesListItem from '../components/sales/SalesListItem';
import SalesPagination from '../components/sales/SalesPagination';
import AddSaleModal from '../components/sales/AddSaleModal';
import EditSaleModal from '../components/sales/EditSaleModal';

interface Venda {
  id_venda: number;
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string;
  data_venda: string;
  quantidade: number;
  imagem_url?: string | null;
  cliente_nome?: string | null;
  cliente_email?: string | null;
  cliente_telefone?: string | null;
}

export default function SalesPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSale, setEditSale] = useState<Venda | null>(null);

  const fetchSales = async (page: number, search: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/vendas/', {
        params: {
          search: search,
          page: page,
        },
      });

      const data = response.data;
      setVendas(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err: any) {
      setError('Falha ao buscar vendas. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSales(currentPage, searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, currentPage]); 

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); 
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFirstPage = () => {
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleLastPage = () => {
    if (currentPage !== totalPages) setCurrentPage(totalPages);
  };

  const handleSaleAdded = async () => {
    // Após salvar, vá para a última página e atualize a lista para mostrar a nova venda
    try {
      const resp = await api.get('/vendas/', { params: { page: 1, search: searchTerm } });
      const totalItems = resp.data?.count ?? 0;
      const lastPage = Math.max(1, Math.ceil(totalItems / 10));
      setCurrentPage(lastPage);
      await fetchSales(lastPage, searchTerm);
    } catch (e) {
      await fetchSales(currentPage, searchTerm);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <SalesHeader />
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow"
        >
          Nova Venda
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar por produto ou vendedor..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendas.map((venda) => (
            <div key={venda.id_venda} className="bg-white border rounded-lg p-3 shadow hover:shadow-md transition cursor-pointer" onClick={() => setEditSale(venda)}>
              <div className="h-40 w-full bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {venda.imagem_url ? (
                  <img src={venda.imagem_url} alt={venda.nome_produto} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H9l-4 4v-4H5a2 2 0 01-2-2V5z"/>
                  </svg>
                )}
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{venda.nome_produto}</h3>
                <span className="text-sm text-gray-500">{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm text-gray-600">Vendido por {venda.nome_vendedor}</p>
              <p className="text-sm text-gray-600">Qtd: {venda.quantidade}</p>
              <p className="text-base font-bold text-blue-600 mt-1">{new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(parseFloat(venda.preco_total))}</p>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="p-6 text-center text-gray-500">Carregando...</div>
        )}

        {!isLoading && vendas.length > 0 && (
          <SalesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onFirstPage={handleFirstPage}
            onLastPage={handleLastPage}
          />
        )}

        {!isLoading && !vendas.length && (
          <div className="p-10 text-center text-gray-500">
            <h3 className="text-xl font-semibold">Nenhuma venda encontrada</h3>
            <p>Tente ajustar os termos da sua busca ou realize uma nova venda.</p>
          </div>
        )}
        
        {error && (
          <div className="p-10 text-center text-red-600">{error}</div>
        )}
      </div>

      {isModalOpen && (
        <AddSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaleAdded={handleSaleAdded}
        />
      )}

      {editSale && (
        <EditSaleModal
          isOpen={!!editSale}
          sale={editSale}
          onClose={() => setEditSale(null)}
          onSaved={() => fetchSales(currentPage, searchTerm)}
          onDeleted={() => fetchSales(currentPage, searchTerm)}
        />
      )}
    </div>
  );
}