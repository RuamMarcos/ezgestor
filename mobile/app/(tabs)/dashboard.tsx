import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../styles/dashboard/dashboard';

import DashboardHeader from '@/components/dashboard/Header';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ActionCard from '@/components/dashboard/ActionCard';
import { DashboardColors } from '@/constants/DashboardColors';

// --- DADOS MOCADOS (DE EXEMPLO) ---
const MOCK_DATA = {
  summary: [
    { id: '1', title: 'Receita Mensal', value: 'R$ 8.450', color: DashboardColors.purple },
    { id: '2', title: 'Vendas', value: '127', color: DashboardColors.green },
    { id: '3', title: 'Estoque Baixo', value: '23', color: DashboardColors.orange },
    { id: '4', title: 'Lucro', value: 'R$ 2.890', color: DashboardColors.blue },
  ],
  actions: [
    { id: '1', label: 'Nova Venda', iconName: 'cart-plus', onPress: () => {} },
    { id: '2', label: 'Emitir NF-e', iconName: 'file-document-outline', onPress: () => {} },
    { id: '3', label: 'Estoque', iconName: 'archive-outline', onPress: () => {} },
    { id: '4', label: 'Relatórios', iconName: 'chart-line', onPress: () => {} },
  ],
  recentSales: [
    { id: '1', customer: 'João Silva', product: 'Camiseta Polo - Hoje', amount: 'R$ 45,00' },
    { id: '2', customer: 'Maria Santos', product: 'Tênis Esportivo - Ontem', amount: 'R$ 120,00' },
  ],
} as const;

export default function DashboardScreen() {
  const [data, setData] = useState<typeof MOCK_DATA | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        setData(MOCK_DATA);
      }, 1000);
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DashboardColors.headerBlue} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dashboard</Text>

        {/* Cards de Resumo */}
        <View style={styles.cardsGrid}>
          {data.summary.map((item) => (
            <SummaryCard key={item.id} title={item.title} value={item.value} backgroundColor={item.color} />
          ))}
        </View>

        {/* Cards de Ação */}
        <View style={styles.cardsGrid}>
          {data.actions.map((item) => (
            <ActionCard
              key={item.id}
              label={item.label}
              iconName={item.iconName}
              onPress={item.onPress}
            />
          ))}
        </View>

        {/* Vendas Recentes */}
        <View style={styles.recentSalesContainer}>
          <Text style={styles.title}>Vendas Recentes</Text>
          {data.recentSales.map((sale) => (
            <View key={sale.id} style={styles.saleItem}>
              <View>
                <Text style={styles.saleCustomer}>{sale.customer}</Text>
                <Text style={styles.saleProduct}>{sale.product}</Text>
              </View>
              <Text style={styles.saleAmount}>{sale.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}