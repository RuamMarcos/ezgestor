// mobile/components/stock/ProductList.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import type { Product } from '../../services/stockService';
import { styles } from '../../styles/stock/ProductListSyles';

interface ProductListProps {
  products: Product[];
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof numValue !== 'number' || isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

const ProductItem = ({ item }: { item: Product }) => (
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
  </View>
);

const ProductList = ({ products }: ProductListProps) => {
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductItem item={item} />}
      keyExtractor={(item) => item.id_produto!.toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>}
    />
  );
};


export default ProductList;