import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, View } from 'react-native';
import { getProducts, createProduct } from '../../services/stockService';
import type { Product } from '../../services/stockService';
import ProductList from '../../components/stock/ProductList';
import AddProductModal from '../../components/stock/AddProductModal';
import { DashboardColors } from '@/constants/DashboardColors';

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
        } catch (error) {
            console.error("Erro ao adicionar produto:", error);
            Alert.alert("Erro", "Falha ao adicionar produto.");
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
            
            <ProductList products={products} />

            <AddProductModal 
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddProduct}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DashboardColors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DashboardColors.darkText,
    },
    addButton: {
        backgroundColor: DashboardColors.headerBlue,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});