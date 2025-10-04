import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { styles } from '../../styles/dashboard/DashboardStyles';

import SummaryCard from '@/components/dashboard/SummaryCard';
import ActionCard from '@/components/dashboard/ActionCard';
import SimpleAddSaleModal from '@/components/sales/SimpleAddSaleModal';
import { DashboardColors } from '@/constants/DashboardColors';

export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleNewSale = () => {
    setModalVisible(true);
  };

  const handleSaleAdded = () => {
    // Aqui você pode atualizar os dados do dashboard após uma nova venda
    // Por exemplo, recarregar as vendas recentes
    console.log('Nova venda adicionada - atualizando dashboard');
  };

  useEffect(() => {
    const fetchData = async () => {
      // --- DADOS MOCADOS (DE EXEMPLO) ---
      const MOCK_DATA = {
        summary: [
          { id: '1', title: 'Receita Mensal', value: 'R$ 8.450', color: DashboardColors.purple },
          { id: '2', title: 'Vendas', value: '127', color: DashboardColors.green },
          { id: '3', title: 'Estoque Baixo', value: '23', color: DashboardColors.orange },
          { id: '4', title: 'Lucro', value: 'R$ 2.890', color: DashboardColors.blue },
        ],
        actions: [
          { id: '1', label: 'Nova Venda', iconName: 'cart-plus', onPress: handleNewSale },
          { id: '2', label: 'Emitir NF-e', iconName: 'file-document-outline', onPress: () => {} },
          { id: '3', label: 'Estoque', iconName: 'archive-outline', onPress: () => {} },
          { id: '4', label: 'Relatórios', iconName: 'chart-line', onPress: () => {} },
        ],
        recentSales: [
          { id: '1', customer: 'João Silva', product: 'Camiseta Polo - Hoje', amount: 'R$ 45,00' },
          { id: '2', customer: 'Maria Santos', product: 'Tênis Esportivo - Ontem', amount: 'R$ 120,00' },
        ],
      };

      // Simula o carregamento dos dados
      setTimeout(() => {
        setData(MOCK_DATA);
      }, 1000);
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DashboardColors.headerBlue} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.safeArea} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.cardsGrid}>
        {data.summary.map((item: any) => (
          <SummaryCard key={item.id} title={item.title} value={item.value} backgroundColor={item.color} />
        ))}
      </View>

      <View style={styles.cardsGrid}>
        {data.actions.map((item: any) => (
          <ActionCard
            key={item.id}
            label={item.label}
            iconName={item.iconName}
            onPress={item.onPress}
          />
        ))}
      </View>

      <View style={styles.recentSalesContainer}>
        <Text style={styles.title}>Vendas Recentes</Text>
        {data.recentSales.map((sale: any) => (
          <View key={sale.id} style={styles.saleItem}>
            <View>
              <Text style={styles.saleCustomer}>{sale.customer}</Text>
              <Text style={styles.saleProduct}>{sale.product}</Text>
            </View>
            <Text style={styles.saleAmount}>{sale.amount}</Text>
          </View>
        ))}
      </View>

      <SimpleAddSaleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSaleAdded={handleSaleAdded}
      />
    </ScrollView>
  );
}