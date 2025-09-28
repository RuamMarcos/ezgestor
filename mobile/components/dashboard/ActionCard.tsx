import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles, cardWidth } from '../../styles/dashboard/ActionCardStyles';

type ActionCardProps = {
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
};

export default function ActionCard({ label, iconName, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity style={[styles.cardContainer, { width: cardWidth }]} onPress={onPress}>
      <MaterialCommunityIcons name={iconName} size={28} color={DashboardColors.grayText} />
      <Text style={styles.labelText}>{label}</Text>
    </TouchableOpacity>
  );
}