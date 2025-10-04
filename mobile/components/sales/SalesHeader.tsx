import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/sales/SalesHeaderStyles';

interface SalesHeaderProps {
  onAddSale: () => void;
}

const SalesHeader = ({ onAddSale }: SalesHeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Vendas</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddSale}>
        <Text style={styles.addButtonText}>Nova Venda</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SalesHeader;