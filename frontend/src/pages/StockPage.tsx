import { useState, useEffect } from 'react';
import ProductTable from '../components/stock/ProductTable';
import AddProductModal from '../components/stock/AddProductModal';
import { getProducts, createProduct, deleteProduct } from '../services/stockService';
import type { Product } from '../services/stockService';


function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(false);
    fetchProducts(); // Atualiza a lista após adicionar
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

      {loading ? (
        <p>Carregando produtos...</p>
      ) : (
        <ProductTable 
          produtos={products} 
          onDeleteProduct={handleDeleteProduct}
        />
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