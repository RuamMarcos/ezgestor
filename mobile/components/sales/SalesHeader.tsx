import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { styles } from '../../styles/sales/SalesHeaderStyles';

interface SalesHeaderProps {
  onAddSale: () => void;
}

const SalesHeader = ({ onAddSale }: SalesHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.darkText }]}>Vendas</Text>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.headerBlue }]} onPress={onAddSale}>
        <Text style={[styles.addButtonText, { color: colors.background }]}>Nova Venda</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SalesHeader;