import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '@/components/shared/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { nivelAcesso } = useAuth();
  const { colors, isDark } = useTheme();
  const isAdmin = nivelAcesso === 'administrador';

  return (
    <ProtectedRoute>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <DashboardHeader />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: colors.headerBlue,
            tabBarInactiveTintColor: colors.grayText,
            tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 0,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
            overflow: 'hidden',
          },
          }}
        >
          {/* Dashboard - Apenas Administradores */}
          <Tabs.Screen
            name="dashboard"
            options={{
              href: isAdmin ? '/(tabs)/dashboard' : null,
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? (isDark ? colors.lightGray : '#E8EAF6') : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="home-variant" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Início</Text>
                </View>
              ),
            }}
          />
          {/* Vendas - Todos */}
          <Tabs.Screen
            name="sales"
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? (isDark ? colors.lightGray : '#E8EAF6') : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="cart-outline" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Vendas</Text>
                </View>
              ),
            }}
          />
          {/* Estoque - Todos */}
          <Tabs.Screen
            name="stock"
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? (isDark ? colors.lightGray : '#E8EAF6') : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="archive-outline" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Estoque</Text>
                </View>
              ),
            }}
          />
          {/* Financeiro - Apenas Administradores */}
          <Tabs.Screen
            name="financial"
            options={{
              href: isAdmin ? '/(tabs)/financial' : null,
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? (isDark ? colors.lightGray : '#E8EAF6') : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="currency-usd" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Financeiro</Text>
                </View>
              ),
            }}
          />
          {/* Configurações - Apenas Administradores */}
          <Tabs.Screen
            name="settings"
            options={{
              href: isAdmin ? '/(tabs)/settings' : null,
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? (isDark ? colors.lightGray : '#E8EAF6') : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="cog-outline" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Config</Text>
                </View>
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 55,
    borderRadius: 16,
  },
});