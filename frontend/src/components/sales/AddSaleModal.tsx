import React, { useState, useEffect } from 'react';
import api from '../../api';

interface Product {
  id_produto: number;
  nome: string;
  preco_venda: number; // coerced to number on fetch
  quantidade_estoque: number; // coerced to number on fetch
  codigo_do_produto?: string;
}

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleAdded: () => void;
}

export default function AddSaleModal({ isOpen, onClose, onSaleAdded }: AddSaleModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  // Optional client info
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers to avoid runtime crashes when backend returns strings for Decimal fields
  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (value === null || value === undefined) return 0;
    const n = Number(String(value).replace(',', '.'));
    return Number.isNaN(n) ? 0 : n;
  };

  const formatCurrency = (value: unknown): string => {
    const n = toNumber(value);
    try {
      return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch {
      return `R$ ${n.toFixed(2)}`;
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchProducts();
    }
  }, [isOpen]);

  // Update selected product when selection changes
  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const product = products.find((p: Product) => p.id_produto === selectedProductId);
      setSelectedProduct(product || null);
      setQuantity('1');
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId, products]);

  const resetForm = () => {
    setSelectedProductId(null);
    setSelectedProduct(null);
    setQuantity('1');
    setError(null);
    setProducts([]);
    setClienteNome('');
    setClienteEmail('');
    setClienteTelefone('');
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoadingProducts(true);
      setError(null);
      console.log('🛒 Buscando produtos disponíveis...');
      
      const response = await api.get('/vendas/produtos_disponiveis/');
      console.log('✅ Produtos recebidos:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Normalize numeric fields to numbers to avoid toFixed errors
        const normalized: Product[] = response.data.map((p: any) => ({
          id_produto: p.id_produto ?? p.id ?? p.idProduto ?? 0,
          nome: p.nome ?? p.name ?? 'Produto',
          preco_venda: toNumber(p.preco_venda ?? p.preco ?? p.precoVenda),
          quantidade_estoque: toNumber(p.quantidade_estoque ?? p.estoque ?? p.qtdEstoque),
          codigo_do_produto: p.codigo_do_produto ?? p.codigo ?? p.sku,
        }));
        setProducts(normalized);
        if (response.data.length === 0) {
          setError('Nenhum produto disponível para venda no momento.');
        }
      } else {
        console.warn('⚠️ Resposta da API não é um array:', response.data);
        setProducts([]);
        setError('Formato de dados inválido recebido da API');
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar produtos:', error);
      setProducts([]);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Timeout na conexão. Verifique sua internet.');
      } else if (error.response?.status === 401) {
        setError('Não autorizado. Faça login novamente.');
      } else if (error.response?.status === 403) {
        setError('Acesso negado. Verifique suas permissões.');
      } else if (error.response?.status >= 500) {
        setError('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (error.response?.status === 404) {
        setError('Endpoint não encontrado. Verifique se o backend está rodando.');
      } else {
        setError(`Erro ao carregar produtos: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateTotal = (): number => {
    if (!selectedProduct) return 0;
    const qty = parseInt(quantity || '0');
    const price = toNumber(selectedProduct.preco_venda);
    return price * (Number.isNaN(qty) ? 0 : qty);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError('Selecione um produto');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }

    if (quantityNum > selectedProduct.quantidade_estoque) {
      setError(`Quantidade máxima disponível: ${selectedProduct.quantidade_estoque}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Enviando venda:', {
        produto_id: selectedProduct.id_produto,
        quantidade: quantityNum,
      });
      
      const response = await api.post('/vendas/', {
        produto_id: selectedProduct.id_produto,
        quantidade: quantityNum,
        // Optional client info: only send if filled
        ...(clienteNome ? { cliente_nome: clienteNome } : {}),
        ...(clienteEmail ? { cliente_email: clienteEmail } : {}),
        ...(clienteTelefone ? { cliente_telefone: clienteTelefone } : {}),
      });

      console.log('✅ Venda registrada com sucesso!', response.data);
      alert('Venda registrada com sucesso!');
      onSaleAdded();
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao criar venda:', error);
      
      if (error.response?.data?.quantidade) {
        setError(error.response.data.quantidade[0]);
      } else if (error.response?.data?.produto_id) {
        setError(error.response.data.produto_id[0]);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Timeout na conexão. Verifique sua internet.');
      } else if (error.response?.status === 401) {
        setError('Não autorizado. Faça login novamente.');
      } else if (error.response?.status >= 500) {
        setError('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (error.response?.status === 404) {
        setError('Endpoint não encontrado. Verifique se o backend está rodando.');
      } else {
        setError(`Erro ao registrar venda: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nova Venda</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produto
            </label>
            {loadingProducts ? (
              <div className="border border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500">Carregando produtos...</p>
              </div>
            ) : error && products.length === 0 ? (
              <div className="border border-gray-300 rounded-lg p-4 text-center">
                <p className="text-red-600 text-sm mb-2">Não foi possível carregar os produtos</p>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={selectedProductId || ''}
                onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="">
                  {products.length === 0 ? 'Nenhum produto disponível' : 'Selecione um produto'}
                </option>
                {(products || []).map((product) => (
                  <option key={product.id_produto} value={product.id_produto}>
                    {product.nome} - {formatCurrency(product.preco_venda)} (Est: {toNumber(product.quantidade_estoque)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Optional Client Info */}
          <div className="mb-4 grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do cliente (opcional)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex.: João da Silva"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do cliente (opcional)</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                placeholder="exemplo@dominio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do cliente (opcional)</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Quantity Input */}
          {selectedProduct && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={quantity}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 0;
                    if (num <= selectedProduct.quantidade_estoque) {
                      setQuantity(e.target.value);
                    }
                  }}
                  min="1"
                  max={selectedProduct.quantidade_estoque}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Máximo disponível: {selectedProduct.quantidade_estoque}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Preço unitário:</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedProduct?.preco_venda)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Quantidade:</span>
                  <span className="text-sm font-medium">{quantity}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Total:</span>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              disabled={!selectedProduct || loading}
            >
              {loading ? 'Processando...' : 'Registrar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}