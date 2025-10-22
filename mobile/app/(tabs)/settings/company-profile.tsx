import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '@/styles/settings/CompanyProfileStyles';

export default function CompanyProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={DashboardColors.headerBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil da Empresa</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="office-building-outline"
            size={80}
            color={DashboardColors.grayText}
          />
          <Text style={styles.emptyStateTitle}>Em Desenvolvimento</Text>
          <Text style={styles.emptyStateText}>
            Esta funcionalidade estará disponível em breve
          </Text>
        </View>
      </View>
    </View>
  );
}
