// mobile/components/stock/ProductList.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import type { Product } from '../../services/stockService';
import { DashboardColors } from '@/constants/DashboardColors';

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

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
  },
  itemSku: {
    fontSize: 12,
    color: DashboardColors.grayText,
  },
  itemDetails: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
  },
  itemQuantity: {
    fontSize: 16,
    color: DashboardColors.darkText,
  },
  itemPrice: {
    fontSize: 12,
    color: DashboardColors.grayText,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusLow: {
    backgroundColor: '#fee2e2',
  },
  statusOk: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: DashboardColors.grayText,
  },
});

export default ProductList;