import { useState, useEffect } from 'react';
import { getAvailableProducts, createSale, type Product, type Sale } from '../../services/salesService';

interface AddSaleModalProps {
  onClose: () => void;
  onSave: () => void;
}

function AddSaleModal({ onClose, onSave }: AddSaleModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getAvailableProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos disponíveis');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id_produto === productId);
    setSelectedProduct(product || null);
    setQuantity(1); // Reset quantity when product changes
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(value, selectedProduct?.quantidade_estoque || 1)));
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.preco_venda * quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError('Selecione um produto');
      return;
    }

    if (quantity > selectedProduct.quantidade_estoque) {
      setError(`Quantidade máxima disponível: ${selectedProduct.quantidade_estoque}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const saleData: Sale = {
        produto_id: selectedProduct.id_produto,
        quantidade: quantity,
      };

      await createSale(saleData);
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar venda:', error);
      if (error.response?.data?.quantidade) {
        setError(error.response.data.quantidade[0]);
      } else if (error.response?.data?.produto_id) {
        setError(error.response.data.produto_id[0]);
      } else {
        setError('Erro ao registrar venda. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Nova Venda</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produto
            </label>
            {loadingProducts ? (
              <div className="p-3 text-gray-500">Carregando produtos...</div>
            ) : (
              <select
                value={selectedProduct?.id_produto || ''}
                onChange={handleProductChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id_produto} value={product.id_produto}>
                    {product.nome} - R$ {product.preco_venda.toFixed(2)} 
                    (Estoque: {product.quantidade_estoque})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedProduct && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.quantidade_estoque}
                  value={quantity}
                  onChange={handleQuantityChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo disponível: {selectedProduct.quantidade_estoque}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Preço unitário:</span>
                  <span className="font-medium">R$ {selectedProduct.preco_venda.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Quantidade:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-lg font-bold text-purple-600">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedProduct || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : 'Registrar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSaleModal;