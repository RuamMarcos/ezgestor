import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/sales/SalesHeaderStyles';
import { useTheme } from '@/context/ThemeContext';

interface SalesHeaderProps {
  onAddSale: () => void;
}

const SalesHeader = ({ onAddSale }: SalesHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.darkText }]}>Vendas</Text>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.headerBlue }]} onPress={onAddSale}>
        <Text style={styles.addButtonText}>Nova Venda</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SalesHeader;