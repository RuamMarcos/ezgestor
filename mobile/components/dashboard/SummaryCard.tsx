import React from 'react';
import { View, Text } from 'react-native';
import { styles, cardWidth } from '../../styles/dashboard/SummaryCardStyles';

type SummaryCardProps = {
  title: string;
  value: string;
  backgroundColor: string;
};

export default function SummaryCard({ title, value, backgroundColor }: SummaryCardProps) {
  return (
    <View style={[styles.cardContainer, { backgroundColor, width: cardWidth }]}>
      <Text style={styles.valueText}>{value}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
}