import React, { useState, useEffect } from 'react';
import api from '../api';

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

  const fetchSales = async (page: number) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/vendas/', {
        params: {
          search: searchTerm,
          page: page,
        },
      });

      const data = response.data;
      setVendas(data.results);
      setTotalPages(Math.ceil(data.count / 10)); // Assumindo 10 itens por página
    } catch (err: any) {
      setError('Falha ao buscar vendas. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchSales(1);
    }, 500); // Debounce para a pesquisa

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchSales(currentPage);
  }, [currentPage]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Histórico de Vendas</h1>
        <p className="text-gray-500 mt-1">Pesquise e visualize todas as vendas registradas.</p>
      </header>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar por produto ou vendedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {vendas.map((venda) => (
            <li
              key={venda.id_venda}
              className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{venda.nome_produto}</p>
                <p className="text-sm text-gray-500">
                  Vendido por {venda.nome_vendedor} em {formatDate(venda.data_venda)}
                </p>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(venda.preco_total)}
              </p>
            </li>
          ))}
        </ul>

        {isLoading && (
          <div className="p-6 text-center text-gray-500">Carregando...</div>
        )}

        {!isLoading && vendas.length > 0 && (
          <div className="p-4 flex justify-center items-center space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
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
    </div>
  );
}