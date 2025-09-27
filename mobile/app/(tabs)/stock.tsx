import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, View } from 'react-native';
import { getProducts, createProduct } from '../../services/StockService';
import type { Product } from '../../services/StockService';
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '../../styles/stock/StockStyles';

export default function StockScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        setIsModalOpen(false);
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

    // Função placeholder para a edição
    const handleEditProduct = (product: Product) => {
        Alert.alert("Editar Produto", `Você selecionou para editar: ${product.nome}`);
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
            
            <ProductList products={products} onEditProduct={handleEditProduct} />

            <AddProductModal 
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddProduct}
            />
        </View>
    );
}

