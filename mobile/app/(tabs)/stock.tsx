import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, View, Platform, TextInput } from 'react-native';
import { getProducts, createProduct, deleteProduct } from '../../services/StockService';
import type { Product } from '../../services/StockService';
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '../../styles/stock/StockStyles';

export default function StockScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busca, setBusca] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
            await fetchProducts(currentPage, busca);
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
            setProducts(prevProducts => prevProducts.filter(p => p.id_produto !== productId));
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
    
    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={DashboardColors.headerBlue} />
            </View>
        );
    }
    
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
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddProduct}
            />
        </View>
    );
}

