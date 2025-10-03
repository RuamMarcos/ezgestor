import React, { useState, useEffect } from 'react';
import api from '../api';
import SalesHeader from '../components/sales/SalesHeader';
import SalesListItem from '../components/sales/SalesListItem';
import SalesPagination from '../components/sales/SalesPagination';

interface Venda {
  id_venda: number;
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string;
  data_venda: string;
}

export default function SalesPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <SalesHeader />

      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar por produto ou vendedor..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {vendas.map((venda) => (
            <SalesListItem key={venda.id_venda} venda={venda} />
          ))}
        </ul>

        {isLoading && (
          <div className="p-6 text-center text-gray-500">Carregando...</div>
        )}

        {!isLoading && vendas.length > 0 && (
          <SalesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}

        {!isLoading && !vendas.length && (
          <div className="p-10 text-center text-gray-500">
            <h3 className="text-xl font-semibold">Nenhuma venda encontrada</h3>
            <p>Tente ajustar os termos da sua busca ou realize uma nova venda.</p>
          </div>
        )}
        {error && (
            <div className="p-10 text-center text-red-600">{error}
            </div>
        )}
      </div>
    </div>
  );
}