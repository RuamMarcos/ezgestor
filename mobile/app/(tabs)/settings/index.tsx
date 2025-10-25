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
  const { themeSetting, previewTheme, isDark, setPreview, applyTheme, cancelPreview, colors } = useTheme();

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
            {(['light','dark','system'] as const).map(opt => {
              const current = previewTheme ?? themeSetting;
              const isSelected = current === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setPreview(opt)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#2563eb' : '#d1d5db',
                  }}
                >
                  <Text style={{ color: isSelected ? '#1d4ed8' : '#111827' }}>
                    {opt === 'light' ? 'Claro' : opt === 'dark' ? 'Escuro' : 'Automático'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.optionDescription, { marginTop: 8, color: colors.grayText }]}>Pré-visualizando: {previewTheme ?? themeSetting} • Resolução atual: {isDark ? 'Escuro' : 'Claro'}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity onPress={() => applyTheme(previewTheme ?? themeSetting)} style={{ backgroundColor: colors.headerBlue, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}>
              <Text style={{ color: colors.background, fontWeight: '600' }}>Aplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelPreview} style={{ borderWidth: 1, borderColor: colors.border, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}>
              <Text style={{ color: colors.darkText }}>Cancelar</Text>
            </TouchableOpacity>
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
