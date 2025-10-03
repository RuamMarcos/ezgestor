import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/sales/SaleListItemStyles';

interface Venda {
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string;
  data_venda: string;
}

interface SaleListItemProps {
  item: Venda;
}

const formatarData = (dataString: string) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

const SaleListItem = ({ item }: SaleListItemProps) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item.nome_produto}</Text>
        <Text style={styles.saleDetail}>
          Vendido por {item.nome_vendedor} em {formatarData(item.data_venda)}
        </Text>
      </View>
      <Text style={styles.price}>{formatCurrency(item.preco_total)}</Text>
    </View>
  );
};

export default SaleListItem;