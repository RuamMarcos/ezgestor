import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { styles, cardWidth } from '../../styles/dashboard/ActionCardStyles';

type ActionCardProps = {
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
};

export default function ActionCard({ label, iconName, onPress }: ActionCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.cardContainer, { width: cardWidth, backgroundColor: colors.card }]} onPress={onPress}>
      <MaterialCommunityIcons name={iconName} size={28} color={colors.grayText} />
      <Text style={[styles.labelText, { color: colors.darkText }]}>{label}</Text>
    </TouchableOpacity>
  );
}