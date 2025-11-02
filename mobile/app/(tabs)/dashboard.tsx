import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { styles } from '../../styles/dashboard/DashboardStyles';

import SummaryCard from '@/components/dashboard/SummaryCard';
import ActionCard from '@/components/dashboard/ActionCard';
import ReportModal from '@/components/shared/ReportModal';
import { getFinancialStats, FinancialStats } from '@/services/FinancialService';
import api from '@/utils/api';
import DailySalesChart from '@/components/dashboard/DailySalesChart';
import { router } from 'expo-router';
import { AdminRoute } from '@/components/AdminRoute';
import { useTheme } from '@/context/ThemeContext';

type RecentSale = {
  id_venda: number;
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string; // vem como string do backend
  data_venda: string;
  cliente_nome?: string | null;
};

type ChartData = {
  date: string;
  total: number;
};

const formatCurrency = (value: number | string): string => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [totalVendas, setTotalVendas] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setChartLoading(true);
    setError(null);
    try {
      const [
        financial,        // 1) Estatísticas financeiras
        vendasResp,       // 2) Total de vendas (count)
        lowStockResp,     // 3) Produtos em baixo estoque (count)
        recentResp,       // 4) Vendas recentes (últimas 5)
        chartResp,        // 5) Dados para o gráfico de vendas diárias
      ] = await Promise.all([
        // 1) Estatísticas financeiras (Entradas, Saídas, Saldo)
        getFinancialStats(),
        
        // 2) Total de vendas (usa paginação para obter apenas o count)
        api.get('/vendas/', { params: { page_size: 1 } }),
        
        // 3) Produtos em baixo estoque (usa filtro + page_size=1 para pegar apenas o count)
        api.get('/estoque/produtos/', { params: { em_baixo_estoque: true, page_size: 1 } }),
        
        // 4) Vendas recentes (pega as 5 mais recentes)
        api.get('/vendas/', { params: { page_size: 5 } }),
        
        // 5) Resumo de vendas para o gráfico dos últimos 7 dias
        api.get('/vendas/daily-summary-last-7-days/'),
      ]);

      // Atualiza os estados com os resultados recebidos
      setStats(financial);
      setTotalVendas(Number(vendasResp.data?.count ?? 0));
      setLowStockCount(Number(lowStockResp.data?.count ?? 0));
      setRecentSales(recentResp.data?.results ?? []);
      setChartData(chartResp.data ?? []);

    } catch (e: any) {
      const msg = e?.response?.data?.detail || e.message || 'Falha ao carregar o dashboard.';
      setError(msg);
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summaryCards = useMemo(() => {
    return [
      {
        id: '1',
        title: 'Receita',
        value: formatCurrency(stats?.total_entradas ?? 0),
        color: '#6F42C1',
      },
      {
        id: '2',
        title: 'Vendas',
        value: String(totalVendas),
        color: '#28A745',
      },
      {
        id: '3',
        title: 'Estoque Baixo',
        value: String(lowStockCount),
        color: '#FD7E14',
      },
      {
        id: '4',
        title: 'Saldo', // Pode ser exibido como "Lucro" se desejar
        value: formatCurrency(stats?.saldo_atual ?? 0),
        color: '#0D6EFD',
      },
    ];
  }, [stats, totalVendas, lowStockCount]);

  const actions = useMemo(() => [
    { id: '1', label: 'Gerar Relatórios', iconName: 'file-chart' as const, onPress: () => setReportModalOpen(true) },
    { id: '2', label: 'Atualizar', iconName: 'refresh' as const, onPress: loadData },
  ], []);

  if (loading && !stats) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.headerBlue} />
      </View>
    );
  }

  return (
    <AdminRoute>
      <ScrollView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.darkText }]}>Dashboard</Text>

        {error ? (
          <Text style={{ color: 'red', marginHorizontal: 16 }}>{error} </Text>
        ) : null}

        <View style={styles.cardsGrid}>
          {summaryCards.map((item) => (
            <SummaryCard key={item.id} title={item.title} value={item.value} backgroundColor={item.color} />
          ))}
        </View>

        <View style={styles.cardsGrid}>
          {actions.map((item) => (
            <ActionCard
              key={item.id}
              label={item.label}
              iconName={item.iconName}
              onPress={item.onPress}
            />
          ))}
        </View>

        <View style={[styles.chartContainer, { alignItems: 'center' }]}>
          <Text style={[styles.title, { color: colors.darkText }]}>Vendas (Últimos 7 dias)</Text>
          <DailySalesChart data={chartData} loading={chartLoading} />
        </View>

        <View style={styles.recentSalesContainer}>
          <Text style={[styles.title, { color: colors.darkText }]}>Vendas Recentes</Text>
          {recentSales.map((sale) => (
            <View key={sale.id_venda} style={[styles.saleItem, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.saleCustomer, { color: colors.darkText }]}>{sale.cliente_nome || sale.nome_vendedor || '—'}</Text>
                <Text style={[styles.saleProduct, { color: colors.grayText }]}>{sale.nome_produto}</Text>
              </View>
              <Text style={[styles.saleAmount, { color: colors.darkText }]}>{formatCurrency(sale.preco_total)}</Text>
            </View>
          ))}
        </View>

        <ReportModal visible={reportModalOpen} onClose={()=>setReportModalOpen(false)} />
      </ScrollView>
    </AdminRoute>
  );
}