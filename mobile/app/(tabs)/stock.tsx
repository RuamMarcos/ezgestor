import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, View, Platform } from 'react-native';
import { getProducts, createProduct, deleteProduct, quickAddProduct } from '../../services/StockService';
import type { Product } from '../../services/StockService';
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
import QuickAddModal from '../../components/stock/QuickAddModal';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '../../styles/stock/StockStyles';

export default function StockScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

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
            Alert.alert("Erro", "Não foi possível carregar os produtos.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (newProduct: Product) => {
        try {
            await createProduct(newProduct);
            setIsAddModalOpen(false);
            await fetchProducts(); // Recarrega a lista
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
    
    const handleQuickAddSave = async (quickAddValue: string) => {
        if (!quickAddValue || !quickAddValue.includes(':')) {
            Alert.alert("Erro", "Formato inválido. Use 'código:quantidade'.");
            return;
        }
        try {
            await quickAddProduct(quickAddValue);
            setIsQuickAddModalOpen(false);
            await fetchProducts();
            Alert.alert("Sucesso", "Estoque atualizado!");
        } catch (error: any) {
            console.error("Erro na entrada rápida:", error);
            const errorMessage = error.response?.data?.detail || "Produto não encontrado ou formato inválido.";
            Alert.alert("Erro", errorMessage);
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
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={[styles.addButton, {backgroundColor: '#16a34a'}]} onPress={() => setIsQuickAddModalOpen(true)}>
                        <Text style={styles.addButtonText}>Rápida</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalOpen(true)}>
                        <Text style={styles.addButtonText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <ProductList 
                products={products} 
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct} 
            />

            <AddProductModal 
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddProduct}
            />

            <QuickAddModal
                visible={isQuickAddModalOpen}
                onClose={() => setIsQuickAddModalOpen(false)}
                onSave={handleQuickAddSave}
            />
        </View>
    );
}