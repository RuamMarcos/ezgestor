import { useState, useEffect } from 'react';
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
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isQuickAddProductModalOpen, setIsQuickAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddProduct = async (newProduct: Product) => {
    try {
      await createProduct(newProduct);
      setIsAddModalOpen(false);
      fetchProducts();
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
        setProducts(products.filter(p => p.id_produto !== productId));
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
        await fetchProducts();
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
      await fetchProducts();
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
      fetchProducts();
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