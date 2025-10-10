import { useState, useEffect, useRef } from 'react';
import SalesPagination from '../components/sales/SalesPagination';
import ProductTable from '../components/stock/ProductTable';
import AddProductModal from '../components/stock/AddProductModal';
import EditProductModal from '../components/stock/EditProductModal';
import QuickAddModal from '../components/stock/QuickAddModal';
import QuickAddProductModal from '../components/stock/QuickAddProductModal';
import { getProducts, createProduct, deleteProduct, quickAddProduct, addStockToProduct, updateProduct } from '../services/stockService'; // Importe updateProduct
import type { Product } from '../services/stockService';


function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Ref para preservar a posição do scroll
  const scrollPositionRef = useRef<number>(0);
  const shouldPreserveScrollRef = useRef<boolean>(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isQuickAddProductModalOpen, setIsQuickAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
          behavior: 'instant' // No animation for instant scroll
        });
        shouldPreserveScrollRef.current = false;
      });
    }
  }, [loading]);
  
  const handleAddProduct = async (newProduct: Product) => {
  try {
    await createProduct(newProduct);
    setIsAddModalOpen(false);
    
    // Busca o total atualizado para calcular a última página (onde o produto foi inserido)
    const data = await getProducts({ page: 1, search: searchTerm });
    const totalItems = data.count || 0;
    const lastPage = Math.max(1, Math.ceil(totalItems / 10));

  // Ajusta o pager para a última página e atualiza a lista imediatamente para refletir o novo item
  setCurrentPage(lastPage);
  await fetchProducts(lastPage, searchTerm);
    
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

  const handleQuickAddSave = async (quickAddValue: string) => {
    if (!quickAddValue || !quickAddValue.includes(':')) {
        alert("Formato inválido. Use 'código:quantidade'.");
        return;
    }
    try {
        await quickAddProduct(quickAddValue);
        setIsQuickAddModalOpen(false);
        await fetchProducts(currentPage, searchTerm);
        alert("Estoque atualizado com sucesso!");
    } catch (error: any) {
        console.error("Erro na entrada rápida:", error);
        const errorMessage = error.response?.data?.detail || "Produto não encontrado ou formato inválido.";
        alert(`Erro: ${errorMessage}`);
    }
  };

  const handleAddStock = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickAddProductModalOpen(true);
  };

  const handleQuickAddProductSave = async (productId: number, quantity: number) => {
    try {
      await addStockToProduct(productId, quantity);
      setIsQuickAddProductModalOpen(false);
      await fetchProducts(currentPage, searchTerm);
      alert("Estoque atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar estoque:", error);
      const errorMessage = error.response?.data?.detail || "Erro ao adicionar estoque.";
      alert(`Erro: ${errorMessage}`);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct.id_produto!, updatedProduct);
      setIsEditModalOpen(false);
      fetchProducts(currentPage, searchTerm);
      alert("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert("Falha ao atualizar o produto.");
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
        <div className="flex items-center gap-4">
           <button
            onClick={() => setIsQuickAddModalOpen(true)}
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow"
          >
            Entrada Rápida
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow"
          >
            Adicionar Produto
          </button>
        </div>
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
          onAddStock={handleAddStock}
          onEditProduct={handleEditProduct} // Passe a nova função
        />
      )}

      {!loading && products.length > 0 && (
        <SalesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={() => {
            if (currentPage > 1) {
              scrollPositionRef.current = window.scrollY;
              shouldPreserveScrollRef.current = true;
              setCurrentPage(currentPage - 1);
            }
          }}
          onNextPage={() => {
            if (currentPage < totalPages) {
              scrollPositionRef.current = window.scrollY;
              shouldPreserveScrollRef.current = true;
              setCurrentPage(currentPage + 1);
            }
          }}
          onFirstPage={() => {
            if (currentPage !== 1) {
              scrollPositionRef.current = window.scrollY;
              shouldPreserveScrollRef.current = true;
              setCurrentPage(1);
            }
          }}
          onLastPage={() => {
            if (currentPage !== totalPages) {
              scrollPositionRef.current = window.scrollY;
              shouldPreserveScrollRef.current = true;
              setCurrentPage(totalPages);
            }
          }}
        />
      )}

      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddProduct}
        />
      )}

      {isQuickAddModalOpen && (
        <QuickAddModal
            onClose={() => setIsQuickAddModalOpen(false)}
            onSave={handleQuickAddSave}
        />
      )}

      {isQuickAddProductModalOpen && selectedProduct && (
        <QuickAddProductModal
            product={selectedProduct}
            onClose={() => setIsQuickAddProductModalOpen(false)}
            onSave={handleQuickAddProductSave}
        />
      )}

      {isEditModalOpen && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateProduct}
        />
      )}
    </div>
  );
}

export default StockPage;