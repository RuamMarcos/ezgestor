import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Product } from '../../services/StockService';
import { styles } from '../../styles/stock/ProductListStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';

interface ProductListProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (typeof numValue !== 'number' || isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

const ProductList: React.FC<ProductListProps> = ({ products, onEditProduct, onDeleteProduct }) => {

  const handleDelete = (productId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => {
          try {
            onDeleteProduct(productId);
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o produto.");
          }
        }, style: "destructive" }
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text style={styles.itemSku}>SKU: {item.codigo_do_produto || 'N/A'}</Text>
      </View>
      <View style={styles.itemDetails}>
         <Text style={styles.itemQuantity}>{item.quantidade_estoque} un</Text>
         <Text style={styles.itemPrice}>{formatCurrency(item.preco_venda)}</Text>
      </View>
      <View style={[styles.statusBadge, item.em_baixo_estoque ? styles.statusLow : styles.statusOk]}>
        <Text style={[styles.statusText, { color: item.em_baixo_estoque ? '#991b1b' : '#15803d' }]}>
          {item.em_baixo_estoque ? 'Baixo' : 'Ok'}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEditProduct(item)}>
              <MaterialCommunityIcons name="pencil-outline" size={22} color={DashboardColors.headerBlue} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onDeleteProduct(item.id_produto!)}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color={DashboardColors.grayText} />
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
     <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id_produto!.toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado.</Text>}
    />
  );
};

export default ProductList;