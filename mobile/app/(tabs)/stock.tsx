import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, View, Platform, TextInput, Animated, Easing } from 'react-native';
import { getProducts, createProduct, deleteProduct } from '../../services/StockService';
import type { Product } from '../../services/StockService';
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
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
            console.error("Erro ao adicionar produto:", error);
            let message = "Falha ao adicionar produto.";
            if (error.response?.data?.codigo_do_produto) {
                message = error.response.data.codigo_do_produto[0];
            }
            Alert.alert("Erro", message);
        }
    };

    // Função placeholder para a edição
    const handleEditProduct = (product: Product) => {
        Alert.alert("Editar Produto", `Você selecionou para editar: ${product.nome}`);
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
                alert("Produto excluído com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            if (Platform.OS !== 'web') {
                Alert.alert("Erro", "Não foi possível excluir o produto.");
            } else {
                alert("Não foi possível excluir o produto.");
            }
        }
    };

    const handleDeleteProduct = (productId: number) => {
        const confirmationMessage = "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.";

        // 2. Verificar a plataforma
        if (Platform.OS === 'web') {
            if (window.confirm(confirmationMessage)) {
                proceedWithDelete(productId);
            }
        } else {
            Alert.alert(
                "Confirmar Exclusão",
                confirmationMessage,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Excluir", onPress: () => proceedWithDelete(productId), style: "destructive" }
                ]
            );
        }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Text style={styles.title}>Estoque</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsModalOpen(true)}>
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
                    {/* Botão Primeira Página */}
                    <TouchableOpacity
                        style={[styles.paginationIconButton, currentPage === 1 && styles.disabledButton]}
                        onPress={() => currentPage > 1 && setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill={currentPage === 1 ? "#999" : "#FFF"}>
                            <Path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"/>
                        </Svg>
                    </TouchableOpacity>
                    
                    {/* Botão Anterior */}
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
                    
                    {/* Botão Próximo */}
                    <TouchableOpacity
                        style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                        onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <Text style={styles.paginationButtonText}>Próximo</Text>
                    </TouchableOpacity>
                    
                    {/* Botão Última Página */}
                    <TouchableOpacity
                        style={[styles.paginationIconButton, currentPage === totalPages && styles.disabledButton]}
                        onPress={() => currentPage < totalPages && setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill={currentPage === totalPages ? "#999" : "#FFF"}>
                            <Path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"/>
                        </Svg>
                    </TouchableOpacity>
                </View>
            )}

            <AddProductModal 
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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
        </View>
    );
}

