import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CORREÇÃO 1: Adicionado valor inicial `null` e ajustado o tipo.
  const observer = useRef<IntersectionObserver | null>(null);

  // CORREÇÃO 2: Trocado `HTMLDivElement` por `HTMLLIElement`.
  const lastSaleElementRef = useCallback((node: HTMLLIElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);


  const fetchSales = async (isNewSearch: boolean) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    
    const currentPage = isNewSearch ? 1 : page;

    try {
      const response = await api.get('/vendas/', {
        params: {
          search: searchTerm,
          page: currentPage,
        },
      });

      const data = response.data;
      
      setVendas(prevVendas => isNewSearch ? data.results : [...prevVendas, ...data.results]);
      setHasMore(data.next !== null);
    } catch (err: any) {
      setError('Falha ao buscar vendas. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setVendas([]);
    setPage(1);
    setHasMore(true);
    fetchSales(true);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) {
      fetchSales(false);
    }
  }, [page]);


  useEffect(() => {
    const handler = setTimeout(() => {}, 500); 
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


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
          {vendas.map((venda, index) => (
            <li
              ref={index === vendas.length - 1 ? lastSaleElementRef : null}
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
          <div className="p-6 text-center text-gray-500">Carregando mais vendas...</div>
        )}
        {!isLoading && !hasMore && vendas.length > 0 && (
          <div className="p-6 text-center text-gray-400">Você chegou ao fim da lista.</div>
        )}
        {!isLoading && vendas.length === 0 && (
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