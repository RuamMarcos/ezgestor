import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/sales/SalesHeaderStyles';

const SalesHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Histórico de Vendas</Text>
    </View>
  );
};

export default SalesHeader;