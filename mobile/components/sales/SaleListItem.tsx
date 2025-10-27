import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { styles } from '../../styles/sales/SaleListItemStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'react-native';

interface Venda {
  id_venda?: number;
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string;
  data_venda: string;
  pago: boolean;
  quantidade?: number;
  imagem_url?: string | null;
}

interface SaleListItemProps {
  item: Venda;
  onPress?: (item: any) => void;
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

const SaleListItem = ({ item, onPress }: SaleListItemProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress && onPress(item)} activeOpacity={0.8} style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.imageWrapper, { backgroundColor: colors.lightGray }]}>
        {item.imagem_url ? (
          <Image source={{ uri: item.imagem_url }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="image-off-outline" size={40} color={colors.grayText} />
        )}
      </View>
      <Text style={[styles.cardTitle, { color: colors.darkText }]} numberOfLines={1}>{item.nome_produto}</Text>
      <Text style={[styles.cardSub, { color: colors.grayText }]} numberOfLines={1}>por {item.nome_vendedor}</Text>
      <Text style={[styles.cardSub, { color: colors.grayText }]}>{formatarData(item.data_venda)} • {typeof item.quantidade === 'number' ? `${item.quantidade} un` : ''}</Text>
      <Text style={[styles.cardPrice, { color: colors.headerBlue }]}>{formatCurrency(item.preco_total)}</Text>
    </TouchableOpacity>
  );
};

export default SaleListItem;