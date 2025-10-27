import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminRoute } from '@/components/AdminRoute';
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.darkText,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.grayText,
    },
    optionsContainer: {
      padding: 16,
      gap: 12,
    },
    optionCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    optionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.grayText,
    },
  });

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
                  color={colors.headerBlue}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
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
