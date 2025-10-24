import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors } from '@/constants/DashboardColors';
import { AdminRoute } from '@/components/AdminRoute';
import { styles } from '@/styles/settings/SettingsStyles';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeSetting, previewTheme, isDark, setPreview, applyTheme, cancelPreview } = useTheme();

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
        {/* Theme card */}
        <View style={[styles.optionCard, { padding: 16, marginBottom: 16 }]}> 
          <Text style={styles.optionTitle}>Tema</Text>
          <Text style={styles.optionDescription}>Claro, Escuro ou Automático (segue o sistema)</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {(['light','dark','system'] as const).map(opt => (
              <TouchableOpacity key={opt} onPress={() => setPreview(opt)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: themeSetting===opt? '#2563eb' : '#d1d5db' }}>
                <Text style={{ color: themeSetting===opt? '#1d4ed8' : '#111827' }}>{opt === 'light' ? 'Claro' : opt === 'dark' ? 'Escuro' : 'Automático'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.optionDescription, { marginTop: 8 }]}>Pré-visualizando: {previewTheme ?? themeSetting} • Resolução atual: {isDark ? 'Escuro' : 'Claro'}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity onPress={() => applyTheme(previewTheme ?? themeSetting)} style={{ backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Aplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelPreview} style={{ borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}>
              <Text style={{ color: '#111827' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
