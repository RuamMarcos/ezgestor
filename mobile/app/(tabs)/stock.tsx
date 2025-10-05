// mobile/app/(tabs)/stock.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View, Platform, TextInput, Animated, Easing, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, createProduct, deleteProduct, updateProduct, Product } from '../../services/StockService';
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
import EditProductModal from '../../components/stock/EditProductModal';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '../../styles/stock/StockStyles';
import Svg, { Path } from 'react-native-svg';

export default function StockScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [busca, setBusca] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const spinValue = useRef(new Animated.Value(0)).current;

    const fetchProducts = useCallback(async (page: number, search: string) => {
      try {
          setLoading(true);
          const data = await getProducts({ page, search });
          setProducts(data.results);
          setTotalPages(Math.ceil((data.count || 0) / 10));
      } catch (error) {
          console.error("Erro ao buscar produtos:", error);
          Alert.alert("Erro", "Não foi possível carregar os produtos.");
      } finally {
          setLoading(false);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        fetchProducts(currentPage, busca);
      }, [fetchProducts, currentPage, busca])
    );
    
    const handleAddProduct = async (newProduct: Product) => {
        try {
            await createProduct(newProduct);
            setIsAddModalOpen(false);
            const data = await getProducts({ page: 1, search: busca });
            const totalItems = data.count || 0;
            const lastPage = Math.ceil(totalItems / 10);
            setCurrentPage(lastPage);
            Alert.alert("Sucesso", "Produto adicionado!");
        } catch (error: any) {
            let message = "Falha ao adicionar produto.";
            if (error.response?.data?.codigo_do_produto) {
                message = error.response.data.codigo_do_produto[0];
            }
            Alert.alert("Erro", message);
        }
    };
    
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (updatedProduct: Product) => {
        if (!editingProduct || !editingProduct.id_produto) return;

        try {
            setLoading(true);
            await updateProduct(editingProduct.id_produto, updatedProduct);
            setIsEditModalOpen(false);
            setEditingProduct(null);
            await fetchProducts(currentPage, busca);
            Alert.alert("Sucesso", "Produto atualizado!");
        } catch (error: any) {
            let message = "Falha ao atualizar produto.";
            if (error.response?.data?.codigo_do_produto) {
                message = error.response.data.codigo_do_produto[0];
            }
            Alert.alert("Erro", message);
        } finally {
            setLoading(false);
        }
    };

    const proceedWithDelete = async (productId: number) => {
        try {
            await deleteProduct(productId);
            const remaining = products.filter(p => p.id_produto !== productId);
            if (remaining.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchProducts(currentPage, busca);
            }
            Alert.alert("Sucesso", "Produto excluído com sucesso!");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o produto.");
        }
    };

    const handleDeleteProduct = (productId: number) => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir este produto?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", onPress: () => proceedWithDelete(productId), style: "destructive" }
            ]
        );
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Text style={styles.title}>Estoque</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalOpen(true)}>
                    <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar por produto ou SKU..."
                    value={busca}
                    onChangeText={setBusca}
                    placeholderTextColor={DashboardColors.grayText}
                />
            </View>
            
            <ProductList 
                products={products} 
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct} 
            />

            {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                    {/* Botões de paginação aqui */}
                </View>
            )}

            <AddProductModal 
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddProduct}
            />

            <EditProductModal
                visible={isEditModalOpen}
                product={editingProduct}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateProduct}
            />
            
            {loading && (
                <View style={styles.loadingOverlay}>
                     <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            )}
        </View>
    );
}

// Adicione os estilos que faltam ao seu StockStyles.ts
// Ex: searchContainer, searchInput, paginationContainer, loadingOverlay etc.