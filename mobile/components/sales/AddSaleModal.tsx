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
import { useTheme } from '@/context/ThemeContext';

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

export default function AddSaleModal({ visible, onClose, onSaleAdded }: AddSaleModalProps) {
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers to coerce numeric fields and format currency safely
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

  useEffect(() => {
    if (visible) {
      fetchProducts();
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedProductId) {
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
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setError(null);
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoadingProducts(true);
      setError(null);
      console.log('Iniciando busca de produtos...');
      const response = await api.get('/vendas/produtos_disponiveis/');
      console.log('Produtos recebidos:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const normalized: Product[] = response.data.map((p: any) => ({
          id_produto: p.id_produto ?? p.id ?? 0,
          nome: p.nome ?? 'Produto',
          preco_venda: toNumber(p.preco_venda ?? p.preco ?? p.precoVenda),
          quantidade_estoque: toNumber(p.quantidade_estoque ?? p.estoque ?? p.qtdEstoque),
          codigo_do_produto: p.codigo_do_produto ?? p.codigo ?? p.sku,
        }));
        setProducts(normalized);
      } else {
        console.warn('Resposta da API não é um array:', response.data);
        setProducts([]);
        setError('Formato de dados inválido recebido da API');
      }
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
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

  const filteredProducts = products.filter((p) => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.codigo_do_produto ?? '').toLowerCase().includes(q)
    );
  });
  const hasQuery = productSearch.trim().length > 0;

  const calculateTotal = (): number => {
    if (!selectedProduct) return 0;
    const price = toNumber(selectedProduct.preco_venda);
    const qty = parseInt(quantity || '0');
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
      const payload: any = {
        produto_id: selectedProduct.id_produto,
        quantidade: quantityNum,
      };

      const nome = clientName.trim();
      const telefone = clientPhone.trim();
      const email = clientEmail.trim();
      if (nome) payload.cliente_nome = nome;
      if (telefone) payload.cliente_telefone = telefone;
      if (email) payload.cliente_email = email;

      console.log('Enviando venda:', payload);
  await api.post('/vendas/', payload);

  Alert.alert('Sucesso', 'Venda registrada com sucesso!');
  onSaleAdded();
  onClose();
    } catch (error: any) {
      console.error('Erro ao criar venda:', error);
      
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.darkText }]}>Nova Venda</Text>
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
              <Text style={[styles.label, { color: colors.darkText }]}>Produto</Text>
              {loadingProducts ? (
                <View style={[styles.pickerContainer, { justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.lightGray }]}>
                  <ActivityIndicator size="small" color={colors.headerBlue} />
                  <Text style={[styles.helperText, { marginTop: 8, color: colors.grayText }]}>Carregando produtos...</Text>
                </View>
              ) : error && products.length === 0 ? (
                <View style={[styles.pickerContainer, { justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.lightGray }]}>
                  <Text style={styles.errorText}>Não foi possível carregar os produtos</Text>
                  <TouchableOpacity
                    onPress={fetchProducts}
                    style={{ marginTop: 8, padding: 8, backgroundColor: colors.headerBlue, borderRadius: 4 }}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pickerContainer}>
                  <TextInput
                    style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f0f0f0' }}
                    placeholder="Buscar por nome ou código..."
                    value={productSearch}
                    onChangeText={setProductSearch}
                  />
                  {!hasQuery ? (
                    <View style={{ padding: 16 }}>
                      <Text style={styles.helperText}>Digite para buscar produtos...</Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.productList}>
                      <TouchableOpacity
                        style={[
                          styles.productOption,
                          selectedProductId === null && styles.selectedProductOption
                        ]}
                        onPress={() => setSelectedProductId(null)}
                      >
                        <Text style={styles.productOptionText}>
                          {filteredProducts.length === 0 ? 'Nenhum produto encontrado' : 'Selecione um produto'}
                        </Text>
                      </TouchableOpacity>
                      {filteredProducts.map((product: Product) => (
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
                  )}
                </View>
              )}

              {/* Dados do cliente (opcionais) */}
              <Text style={[styles.label, { color: colors.darkText }]}>Cliente (opcional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.darkText }]}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Nome do cliente"
                placeholderTextColor={colors.grayText}
              />
              <View style={{ height: 8 }} />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.darkText }]}
                value={clientPhone}
                onChangeText={setClientPhone}
                keyboardType="phone-pad"
                placeholder="Telefone"
                placeholderTextColor={colors.grayText}
              />
              <View style={{ height: 8 }} />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.darkText }]}
                value={clientEmail}
                onChangeText={setClientEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="E-mail"
                placeholderTextColor={colors.grayText}
              />

              {selectedProduct && (
                <>
                  <Text style={[styles.label, { color: colors.darkText }]}>Quantidade</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.darkText }]}
                    value={quantity}
                    onChangeText={(text: string) => {
                      const num = parseInt(text) || 0;
                      if (num <= selectedProduct.quantidade_estoque) {
                        setQuantity(text);
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={colors.grayText}
                  />
                  <Text style={[styles.helperText, { color: colors.grayText }]}>
                    Máximo disponível: {selectedProduct.quantidade_estoque}
                  </Text>

                  <View style={[styles.summaryContainer, { backgroundColor: colors.lightGray }]}>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.grayText }]}>Preço unitário:</Text>
                      <Text style={[styles.summaryValue, { color: colors.darkText }]}>{formatCurrency(selectedProduct?.preco_venda)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.grayText }]}>Quantidade:</Text>
                      <Text style={[styles.summaryValue, { color: colors.darkText }]}>{quantity}</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryTotalLabel, { color: colors.darkText }]}>Total:</Text>
                      <Text style={[styles.summaryTotalValue, { color: colors.headerBlue }]}>{formatCurrency(calculateTotal())}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {/* Fixed action bar at bottom of modal container to avoid cutoff */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.lightGray }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.darkText }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.headerBlue },
                (!selectedProduct || loading) && { backgroundColor: colors.grayText }
              ]}
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
    maxHeight: '90%' as '90%',
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
    // color will be applied inline
    textAlign: 'center' as 'center',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    // color will be applied inline
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  formContainer: {
    flexDirection: 'column' as 'column',
    justifyContent: 'flex-start' as 'flex-start',
    alignItems: 'stretch' as 'stretch',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600' as '600',
    flex: 1,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    // color will be applied inline
    marginBottom: 6,
    marginTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    flex: 1,
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
    // backgroundColor will be applied inline
  },
  productOptionText: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    // color will be applied inline
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
    // color will be applied inline
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500' as '500',
    // color will be applied inline
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600' as '600',
    // color will be applied inline
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '600' as '600',
    // color will be applied inline
  },
  buttonContainer: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    paddingTop: 10,
    gap: 10,
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
    // color will be applied inline
  },
  submitButton: {
    flex: 1,
    // backgroundColor will be applied inline
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
    // backgroundColor will be applied inline
  },
};