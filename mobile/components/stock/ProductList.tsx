import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Product, deleteProduct } from '../../services/StockService';

interface ProductListProps {
  products: Product[];
  onRefresh: () => void;
  onAddStock: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onRefresh, onAddStock }) => {

  const handleDelete = (productId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: async () => {
          try {
            await deleteProduct(productId);
            onRefresh(); // Atualiza a lista
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o produto.");
          }
        }, style: "destructive" }
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text>Código: {item.codigo_do_produto || 'N/A'}</Text>
        <Text>Preço: R$ {item.preco_venda}</Text>
        <Text>Estoque: {item.quantidade_estoque}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => onAddStock(item)}>
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDelete(item.id_produto!)}>
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={item => item.id_produto!.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50', // Verde
  },
  deleteButton: {
    backgroundColor: '#f44336', // Vermelho
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProductList;