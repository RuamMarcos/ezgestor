import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors } from '@/constants/DashboardColors';
import { AdminRoute } from '@/components/AdminRoute';
import { styles } from '@/styles/settings/SettingsStyles';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeSetting, applyTheme, colors } = useTheme();

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
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.darkText }]}>Configurações</Text>
          <Text style={[styles.headerSubtitle, { color: colors.grayText }]}>Gerencie as configurações do sistema</Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Theme card */}
          <View style={[styles.optionCard, { padding: 16, marginBottom: 16, backgroundColor: colors.card }]}>
            <Text style={[styles.optionTitle, { color: colors.darkText }]}>Tema</Text>
            <Text style={[styles.optionDescription, { color: colors.grayText }]}>Claro, Escuro ou Automático (segue o sistema)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {(['light', 'dark', 'system'] as const).map(opt => {
                const isSelected = themeSetting === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => applyTheme(opt)}
                    style={[
                      {
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                      },
                      isSelected
                        ? { borderColor: '#2563eb' }
                        : { borderColor: colors.border }
                    ]}
                  >
                    <Text
                      style={[
                        {
                          fontSize: 14,
                        },
                        isSelected
                          ? { color: '#1d4ed8' }
                          : { color: colors.darkText }
                      ]}
                    >
                      {opt === 'light' ? 'Claro' : opt === 'dark' ? 'Escuro' : 'Automático'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: colors.card }]}
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
