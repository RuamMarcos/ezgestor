import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';
import { View, Text, StyleSheet } from 'react-native';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '@/components/shared/AppHeader';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <SafeAreaView style={{ flex: 1, backgroundColor: DashboardColors.background }}>
        <DashboardHeader />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: DashboardColors.headerBlue,
            tabBarInactiveTintColor: DashboardColors.grayText,
            tabBarStyle: {
              height: 95,
              backgroundColor: DashboardColors.background,
              borderTopWidth: 0,
              elevation: 0,
              paddingBottom: 15,
            },
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? '#E8EAF6' : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="home-variant" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Início</Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="sales"
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? '#E8EAF6' : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="cart-outline" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Vendas</Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="stock"
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? '#E8EAF6' : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="archive-outline" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Estoque</Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="financial"
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={[
                  styles.tabIconContainer,
                  { backgroundColor: focused ? '#E8EAF6' : 'transparent' }
                ]}>
                  <MaterialCommunityIcons name="currency-usd" size={28} color={color} />
                  <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>Financeiro</Text>
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