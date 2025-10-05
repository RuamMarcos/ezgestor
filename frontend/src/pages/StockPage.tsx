import { useState, useEffect, useRef } from 'react';
import ProductTable from '../components/stock/ProductTable';
import AddProductModal from '../components/stock/AddProductModal';
import { getProducts, createProduct, deleteProduct } from '../services/stockService';
import type { Product } from '../services/stockService';


function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Ref para preservar a posição do scroll
  const scrollPositionRef = useRef<number>(0);
  const shouldPreserveScrollRef = useRef<boolean>(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(currentPage, searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [currentPage, searchTerm]);

  const fetchProducts = async (page: number, search: string) => {
    try {
      setLoading(true);
      const data = await getProducts({ page, search });
      setProducts(data.results);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };
  
  // useEffect para restaurar o scroll após o loading terminar
  useEffect(() => {
    if (!loading && shouldPreserveScrollRef.current) {
      // Pequeno delay para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant' // Sem animação para ser instantâneo
        });
        shouldPreserveScrollRef.current = false;
      });
    }
  }, [loading]);
  
  const handleAddProduct = async (newProduct: Product) => {
  try {
    await createProduct(newProduct);
    setIsModalOpen(false);
    
    // Busca o total atualizado para calcular a última página (onde o produto foi inserido)
    const data = await getProducts({ page: 1, search: searchTerm });
    const totalItems = data.count || 0;
    const lastPage = Math.ceil(totalItems / 10);
    
    // Navega para a última página (onde o novo produto estará)
    setCurrentPage(lastPage);
    
    alert("Produto adicionado com sucesso!");
  } catch (error: any) {
    console.error("Erro ao adicionar produto:", error);
    let message = "Falha ao adicionar produto. Verifique os dados e tente novamente.";
    if (error.response?.data?.codigo_do_produto) {
      message = error.response.data.codigo_do_produto[0];
    }
    alert(message);
  }
};

const handleDeleteProduct = async (productId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
      try {
        await deleteProduct(productId);
        const remaining = products.filter(p => p.id_produto !== productId);
        setProducts(remaining);
        // Se a página ficou vazia e não é a primeira, volta uma página
        if (remaining.length === 0 && currentPage > 1) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          await fetchProducts(newPage, searchTerm);
        }
        alert("Produto excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        alert("Não foi possível excluir o produto. Tente novamente.");
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow"
        >
          Adicionar Produto
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar por nome ou SKU..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      {loading ? (
        <p>Carregando produtos...</p>
      ) : (
        <ProductTable 
          produtos={products} 
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {!loading && products.length > 0 && (
        <div className="p-4 flex justify-center items-center space-x-2">
          {/* Botão Primeira Página */}
          <button
            onClick={() => {
              if (currentPage > 1) {
                scrollPositionRef.current = window.scrollY;
                shouldPreserveScrollRef.current = true;
                setCurrentPage(1);
              }
            }}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-400 transition-colors flex items-center justify-center"
            title="Primeira página"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"/>
            </svg>
          </button>
          
          {/* Botão Anterior */}
          <button
            onClick={() => {
              if (currentPage > 1) {
                scrollPositionRef.current = window.scrollY;
                shouldPreserveScrollRef.current = true;
                setCurrentPage(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-400 transition-colors"
          >
            Anterior
          </button>
          
          <span className="text-gray-700 px-2 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          
          {/* Botão Próximo */}
          <button
            onClick={() => {
              if (currentPage < totalPages) {
                scrollPositionRef.current = window.scrollY;
                shouldPreserveScrollRef.current = true;
                setCurrentPage(currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-400 transition-colors"
          >
            Próximo
          </button>
          
          {/* Botão Última Página */}
          <button
            onClick={() => {
              if (currentPage < totalPages) {
                scrollPositionRef.current = window.scrollY;
                shouldPreserveScrollRef.current = true;
                setCurrentPage(totalPages);
              }
            }}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-400 transition-colors flex items-center justify-center"
            title="Última página"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"/>
            </svg>
          </button>
        </div>
      )}

      {isModalOpen && (
        <AddProductModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddProduct}
        />
      )}
    </div>
  );
}

export default StockPage;