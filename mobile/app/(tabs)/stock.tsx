// mobile/app/(tabs)/stock.tsx
import React, { useState, useEffect, useRef, useCallback} from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View, Platform, TextInput, Animated, Easing, Alert } from 'react-native';
import { useFocusEffect} from '@react-navigation/native';
import { getProducts, createProduct, deleteProduct, updateProduct, Product, addStockToProduct, quickAddProduct } from '../../services/StockService'; // Importe addStockToProduct
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
import EditProductModal from '../../components/stock/EditProductModal';
import QuickAddProductModal from '../../components/stock/QuickAddProductModal'; // Importe o novo modal
import QuickAddModal from '../../components/stock/QuickAddModal';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '../../styles/stock/StockStyles';
import Svg, { Path } from 'react-native-svg';

export default function StockScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busca, setBusca] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Estados para o novo modal de adicionar estoque
    const [isQuickAddProductModalOpen, setIsQuickAddProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Modal para adicionar produto
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Modal para editar produto
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
    
    // Animação do spinner
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Inicia a animação de rotação quando o loading está ativo
        if (loading) {
            spinValue.setValue(0);
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 500, // 500ms por rotação completa (mais rápido que o padrão ~1000ms)
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [loading, spinValue]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setCurrentPage(1);
            fetchProducts(1, busca);
        }, 500);
        return () => clearTimeout(handler);
    }, [busca]);

    useEffect(() => {
        fetchProducts(currentPage, busca);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const fetchProducts = async (page: number, search: string) => {
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
    };

    const handleAddProduct = async (newProduct: Product) => {
        try {
            await createProduct(newProduct);
            setIsModalOpen(false);
            
            // Busca o total atualizado para calcular a última página (onde o produto foi inserido)
            const data = await getProducts({ page: 1, search: busca });
            const totalItems = data.count || 0;
            const lastPage = Math.ceil(totalItems / 10);
            
            // Navega para a última página (onde o novo produto estará)
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
            
            // Se a página ficou vazia e não é a primeira, volta uma página
            if (remaining.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1); // O useEffect vai buscar os dados automaticamente
            } else {
                // Apenas atualiza a lista se não vai mudar de página
                setProducts(remaining);
            }
            
            if (Platform.OS !== 'web') {
                Alert.alert("Sucesso", "Produto excluído com sucesso!");
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

    // Função para abrir o modal de adicionar estoque
    const handleAddStock = (product: Product) => {
      setSelectedProduct(product);
      setIsQuickAddProductModalOpen(true);
    };

    const handleQuickAddSave = async (quickAddValue: string) => {
        if (!quickAddValue || !quickAddValue.includes(':')) {
            Alert.alert("Erro", "Formato inválido. Use 'código:quantidade'.");
            return;
        }
        try {
            await quickAddProduct(quickAddValue);
            setIsQuickAddModalOpen(false);
            await fetchProducts(currentPage, busca);
            Alert.alert("Sucesso", "Estoque atualizado com sucesso!");
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || "Produto não encontrado ou formato inválido.";
            Alert.alert(`Erro: ${errorMessage}`);
        }
      };
  
    // Função para salvar a quantidade de estoque
    const handleQuickAddProductSave = async (productId: number, quantity: number) => {
      try {
        await addStockToProduct(productId, quantity);
        setIsQuickAddProductModalOpen(false);
        await fetchProducts(currentPage, busca);
        Alert.alert("Sucesso", "Estoque atualizado!");
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || "Erro ao adicionar estoque.";
        Alert.alert(`Erro: ${errorMessage}`);
      }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Text style={styles.title}>Estoque</Text>
                <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={[styles.addButton, {marginRight: 10}]} onPress={() => setIsQuickAddModalOpen(true)}>
                    <Text style={styles.addButtonText}>Entrada Rápida</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalOpen(true)}>
                    <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
                </View>
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
                onAddStock={handleAddStock} // Passando a nova função
            />

            {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                    <TouchableOpacity
                        style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                        onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <Text style={styles.paginationButtonText}>Anterior</Text>
                    </TouchableOpacity>
                    <Text style={styles.paginationText}>
                        {currentPage} de {totalPages}
                    </Text>
                    <TouchableOpacity
                        style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                        onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <Text style={styles.paginationButtonText}>Próximo</Text>
                    </TouchableOpacity>
                </View>
            )}

            <AddProductModal 
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddProduct}
            />

            {/* Overlay de Loading */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    rotate: spinValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg'],
                                    }),
                                },
                            ],
                        }}
                    >
                        <ActivityIndicator size="large" color="#FFFFFF" />
                    </Animated.View>
                </View>
            )}
             <QuickAddModal
                visible={isQuickAddModalOpen}
                onClose={() => setIsQuickAddModalOpen(false)}
                onSave={handleQuickAddSave}
            />

            <EditProductModal
                visible={isEditModalOpen}
                product={editingProduct}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateProduct}
            />
            
            {/* Novo Modal para Adicionar Estoque */}
            <QuickAddProductModal
                product={selectedProduct}
                visible={isQuickAddProductModalOpen}
                onClose={() => setIsQuickAddProductModalOpen(false)}
                onSave={handleQuickAddProductSave}
            />

            {loading && (
                <View style={styles.loadingOverlay}>
                     <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            )}
        </View>
    );
}