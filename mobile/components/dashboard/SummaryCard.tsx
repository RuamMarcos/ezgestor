import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { styles, cardWidth } from '../../styles/dashboard/SummaryCardStyles';

type SummaryCardProps = {
  title: string;
  value: string;
  backgroundColor: string;
  span?: 'half' | 'full';
};

export default function SummaryCard({ title, value, backgroundColor, span = 'half' }: SummaryCardProps) {
  const { colors } = useTheme();
  const widthStyle = span === 'full' ? { width: '100%' as const } : { width: cardWidth };
  return (
    <View style={[styles.cardContainer, { backgroundColor }, widthStyle]}> 
      <Text style={[styles.valueText, { color: colors.background }]}>{value}</Text>
      <Text style={[styles.titleText, { color: colors.background }]}>{title}</Text>
    </View>
  );
}