import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminRoute } from '@/components/AdminRoute';
import { styles } from '@/styles/settings/SettingsStyles';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

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
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.darkText }]}>Configurações</Text>
          <Text style={[styles.headerSubtitle, { color: colors.grayText }]}>Gerencie as configurações do sistema</Text>
        </View>

      <View style={styles.optionsContainer}>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(option.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons
                name={option.icon as any}
                size={32}
                color={colors.headerBlue}
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.darkText }]}>{option.title}</Text>
              <Text style={[styles.optionDescription, { color: colors.grayText }]}>{option.description}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.grayText}
            />
          </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </AdminRoute>
  );
}
