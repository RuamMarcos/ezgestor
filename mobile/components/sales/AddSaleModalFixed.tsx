import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../../utils/api';
import { DashboardColors } from '@/constants/DashboardColors';

interface Product {
  id_produto: number;
  nome: string;
  preco_venda: number;
  quantidade_estoque: number;
  codigo_do_produto?: string;
}

interface AddSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSaleAdded: () => void;
}

export default function AddSaleModalFixed({ visible, onClose, onSaleAdded }: AddSaleModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers for numeric coercion and currency formatting
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (value === null || value === undefined) return 0;
    const n = Number(String(value).replace(',', '.'));
    return Number.isNaN(n) ? 0 : n;
  };

  const formatCurrency = (value: any): string => {
    const n = toNumber(value);
    try {
      return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch {
      return `R$ ${n.toFixed(2)}`;
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      resetForm();
      fetchProducts();
    }
  }, [visible]);

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
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoadingProducts(true);
      setError(null);
      console.log('🛒 Buscando produtos disponíveis...');
      
  const response = await api.get('/vendas/produtos_disponiveis/');
      console.log('✅ Produtos recebidos:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const normalized: Product[] = response.data.map((p: any) => ({
          id_produto: p.id_produto ?? p.id ?? 0,
          nome: p.nome ?? 'Produto',
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
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (error.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        setError('Acesso negado. Verifique suas permissões.');
      } else if (error.response?.status >= 500) {
        setError('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        setError('Erro ao carregar produtos disponíveis. Tente novamente.');
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

  const handleSubmit = async (): Promise<void> => {
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
      
      await api.post('/vendas/', {
        produto_id: selectedProduct.id_produto,
        quantidade: quantityNum,
      });

      console.log('✅ Venda registrada com sucesso!');
      Alert.alert('Sucesso', 'Venda registrada com sucesso!');
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
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (error.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status >= 500) {
        setError('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        setError('Erro ao registrar venda. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProductSelector = () => {
    if (loadingProducts) {
      return (
        <View style={[styles.pickerContainer, styles.centerContent]}>
          <ActivityIndicator size="small" color={DashboardColors.headerBlue} />
          <Text style={[styles.helperText, { marginTop: 8 }]}>Carregando produtos...</Text>
        </View>
      );
    }

    if (error && products.length === 0) {
      return (
        <View style={[styles.pickerContainer, styles.centerContent]}>
          <Text style={styles.errorText}>Não foi possível carregar os produtos</Text>
          <TouchableOpacity 
            onPress={fetchProducts} 
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.pickerContainer}>
        <ScrollView style={styles.productList}>
          <TouchableOpacity
            style={[
              styles.productOption,
              selectedProductId === null && styles.selectedProductOption
            ]}
            onPress={() => setSelectedProductId(null)}
          >
            <Text style={styles.productOptionText}>
              {products.length === 0 ? 'Nenhum produto disponível' : 'Selecione um produto'}
            </Text>
          </TouchableOpacity>
          {products.map((product: Product) => (
            <TouchableOpacity
              key={product.id_produto}
              style={[
                styles.productOption,
                selectedProductId === product.id_produto && styles.selectedProductOption
              ]}
              onPress={() => setSelectedProductId(product.id_produto)}
            >
              <Text style={styles.productOptionText}>
                        {product.nome} - {formatCurrency(product.preco_venda)} (Est: {toNumber(product.quantidade_estoque)})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Venda</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <Text style={styles.label}>Produto</Text>
              {renderProductSelector()}

              {selectedProduct && (
                <>
                  <Text style={styles.label}>Quantidade</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={(text: string) => {
                      const num = parseInt(text) || 0;
                      if (num <= selectedProduct.quantidade_estoque) {
                        setQuantity(text);
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                  <Text style={styles.helperText}>
                    Máximo disponível: {selectedProduct.quantidade_estoque}
                  </Text>

                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Preço unitário:</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(selectedProduct?.preco_venda)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Quantidade:</Text>
                      <Text style={styles.summaryValue}>{quantity}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryTotalLabel}>Total:</Text>
                      <Text style={styles.summaryTotalValue}>{formatCurrency(calculateTotal())}</Text>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, (!selectedProduct || loading) && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={!selectedProduct || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Registrar Venda</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%' as '80%',
    width: '90%' as '90%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    alignItems: 'center' as 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as '600',
    color: DashboardColors.darkText,
    textAlign: 'center' as 'center',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: DashboardColors.grayText,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: DashboardColors.darkText,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: DashboardColors.lightGray,
    borderRadius: 10,
    maxHeight: 150,
  },
  centerContent: {
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    padding: 20,
  },
  productList: {
    maxHeight: 150,
  },
  productOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedProductOption: {
    backgroundColor: DashboardColors.headerBlue,
  },
  productOptionText: {
    fontSize: 14,
    color: '#333',
  },
  retryButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: DashboardColors.headerBlue,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: DashboardColors.lightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: DashboardColors.grayText,
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: DashboardColors.grayText,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500' as '500',
    color: DashboardColors.darkText,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: DashboardColors.lightGray,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600' as '600',
    color: DashboardColors.darkText,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '600' as '600',
    color: DashboardColors.headerBlue,
  },
  buttonContainer: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center' as 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: DashboardColors.darkText,
  },
  submitButton: {
    flex: 1,
    backgroundColor: DashboardColors.headerBlue,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center' as 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: DashboardColors.grayText,
  },
};