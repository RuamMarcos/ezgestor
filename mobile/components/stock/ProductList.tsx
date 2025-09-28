import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import type { Product } from '../../services/StockService';
import { styles } from '../../styles/stock/ProductListStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProductListProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void; 
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof numValue !== 'number' || isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

const ProductItem = ({ item, onEdit, onDelete }: { item: Product; onEdit: (p: Product) => void; onDelete: (id: number) => void; }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.nome}</Text>
      <Text style={styles.itemSku}>{item.codigo_do_produto || 'Sem SKU'}</Text>
    </View>
    <View style={styles.itemDetails}>
      <Text style={styles.itemQuantity}>{item.quantidade_estoque} un.</Text>
      <Text style={styles.itemPrice}>{formatCurrency(item.preco_venda)}</Text>
    </View>
    <View style={[styles.statusBadge, item.em_baixo_estoque ? styles.statusLow : styles.statusOk]}>
      <Text style={styles.statusText}>{item.em_baixo_estoque ? 'Baixo' : 'Bom'}</Text>
    </View>
    
    {/* Agrupar botões de ação */}
    <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
            <MaterialCommunityIcons name="pencil-outline" size={22} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id_produto!)} style={styles.actionButton}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#D9534F" />
        </TouchableOpacity>
    </View>
  </View>
);

const ProductList = ({ products, onEditProduct, onDeleteProduct }: ProductListProps) => {
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductItem 
            item={item} 
            onEdit={onEditProduct} 
            onDelete={onDeleteProduct} 
        />
      )}
      keyExtractor={(item) => item.id_produto!.toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>}
    />
  );
};

export default ProductList;