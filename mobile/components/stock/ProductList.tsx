import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Product } from '../../services/StockService';
import { styles } from '../../styles/stock/ProductListStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';

interface ProductListProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onAddStock: (product: Product) => void; // Nova propriedade
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (typeof numValue !== 'number' || isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

const ProductList: React.FC<ProductListProps> = ({ products, onEditProduct, onDeleteProduct, onAddStock }) => {

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
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {item.imagem_url ? (
          <Image source={{ uri: item.imagem_url }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="image-off-outline" size={42} color="#cbd5e1" />
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
      <Text style={styles.cardSub} numberOfLines={1}>SKU: {item.codigo_do_produto || 'N/A'}</Text>
      <Text style={styles.cardSub}>Qtd: {item.quantidade_estoque} • {formatCurrency(item.preco_venda)}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <View style={[styles.statusDot, { backgroundColor: item.em_baixo_estoque ? '#ef4444' : '#10b981' }]} />
        <Text style={styles.cardStatus}>{item.em_baixo_estoque ? 'Baixo' : 'Bom'}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onAddStock(item)}><MaterialCommunityIcons name="plus-box-outline" size={22} color={DashboardColors.green} /></TouchableOpacity>
        <TouchableOpacity onPress={() => onEditProduct(item)}><MaterialCommunityIcons name="pencil-outline" size={22} color={DashboardColors.headerBlue} /></TouchableOpacity>
        <TouchableOpacity onPress={() => onDeleteProduct(item.id_produto!)}><MaterialCommunityIcons name="trash-can-outline" size={22} color={DashboardColors.grayText} /></TouchableOpacity>
      </View>
    </View>
  );

  return (
     <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id_produto!.toString()}
      contentContainerStyle={styles.grid}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado.</Text>}
    />
  );
};

export default ProductList;