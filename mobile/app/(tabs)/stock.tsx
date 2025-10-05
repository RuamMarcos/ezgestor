import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
import QuickAddModal from '../../components/stock/QuickAddModal';
import QuickAddProductModal from '../../components/stock/QuickAddProductModal';
import { getProducts, createProduct, quickAddProduct, addStockToProduct, Product } from '../../services/StockService';
import AppHeader from '../../components/shared/AppHeader';
import { styles } from '../../styles/stock/StockStyles';

export default function StockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isQuickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [isQuickAddProductModalOpen, setQuickAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const handleAddProduct = async (productData: Product) => {
    try {
      await createProduct(productData);
      setAddModalOpen(false);
      fetchProducts();
      Alert.alert("Sucesso", "Produto adicionado!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.codigo_do_produto?.[0] || "Erro ao adicionar produto.";
      Alert.alert("Erro", errorMessage);
    }
  };

  const handleQuickAdd = async (quickAddString: string) => {
    try {
      await quickAddProduct(quickAddString);
      setQuickAddModalOpen(false);
      fetchProducts();
      Alert.alert("Sucesso", "Estoque atualizado!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Produto não encontrado ou formato inválido.";
      Alert.alert("Erro", errorMessage);
    }
  };

  const handleAddStockPress = (product: Product) => {
    setSelectedProduct(product);
    setQuickAddProductModalOpen(true);
  };

  const handleQuickAddProduct = async (productId: number, quantity: number) => {
    try {
      await addStockToProduct(productId, quantity);
      setQuickAddProductModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      Alert.alert("Sucesso", "Estoque atualizado!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Erro ao adicionar estoque.";
      Alert.alert("Erro", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Estoque" />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setQuickAddModalOpen(true)}>
          <Text style={styles.buttonText}>Entrada Rápida</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setAddModalOpen(true)}>
          <Text style={styles.buttonText}>Adicionar Produto</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ProductList products={products} onRefresh={fetchProducts} onAddStock={handleAddStockPress} />
      )}
      <AddProductModal
        visible={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddProduct}
      />
      <QuickAddModal
        visible={isQuickAddModalOpen}
        onClose={() => setQuickAddModalOpen(false)}
        onSave={handleQuickAdd}
      />
      <QuickAddProductModal
        product={selectedProduct}
        visible={isQuickAddProductModalOpen}
        onClose={() => setQuickAddProductModalOpen(false)}
        onSave={handleQuickAddProduct}
      />
    </View>
  );
}