import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors } from '@/constants/DashboardColors';
import { AdminRoute } from '@/components/AdminRoute';
import { styles } from '@/styles/settings/SettingsStyles';

export default function SettingsScreen() {
  const router = useRouter();

  const settingsOptions = [
    {
      id: 'company-profile',
      title: 'Perfil da Empresa',
      description: 'Informações e configurações da empresa',
      icon: 'office-building',
      route: '/(tabs)/settings/company-profile',
    },
    {
      id: 'user-management',
      title: 'Gerenciamento de Usuários',
      description: 'Gerencie os usuários do sistema',
      icon: 'account-group',
      route: '/(tabs)/settings/user-management',
    },
  ];

  return (
    <AdminRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Text style={styles.headerSubtitle}>Gerencie as configurações do sistema</Text>
        </View>

      <View style={styles.optionsContainer}>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={() => router.push(option.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons
                name={option.icon as any}
                size={32}
                color={DashboardColors.headerBlue}
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={DashboardColors.grayText}
            />
          </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </AdminRoute>
  );
}
