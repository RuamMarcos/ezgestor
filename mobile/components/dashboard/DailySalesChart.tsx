import React from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { DashboardColors } from '@/constants/DashboardColors';

interface ChartData {
  date: string;
  total: number;
}

interface DailySalesChartProps {
  data: ChartData[];
  loading: boolean;
}

const screenWidth = Dimensions.get('window').width;

const DailySalesChart: React.FC<DailySalesChartProps> = ({ data, loading }) => {
  if (loading) {
    return <ActivityIndicator size="large" color={DashboardColors.headerBlue} style={{ marginVertical: 40 }} />;
  }

  if (!data || data.length === 0) {
    return <Text style={{ textAlign: 'center', marginVertical: 40, color: '#666' }}>Sem dados de vendas.</Text>;
  }

  // Função para extrair manualmente o dia e mês da string de data
  const getShortDate = (dateStr: string) => {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}`;
    }
    return dateStr;
  };

  const chartData = {
    labels: data.map(item => getShortDate(item.date)),
    datasets: [
      {
        data: data.map(item => item.total),
      },
    ],
  };

  return (
    <View>
      <BarChart
        data={chartData}
        width={screenWidth - 16}
        height={220}
        yAxisLabel="R$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: DashboardColors.background,
          backgroundGradientFrom: DashboardColors.background,
          backgroundGradientTo: DashboardColors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(111, 66, 193, ${opacity})`,
          barPercentage: 1.0,
          barRadius: 5,
          fillShadowGradientFrom: DashboardColors.purple,
          fillShadowGradientFromOpacity: 1,
          fillShadowGradientTo: DashboardColors.purple,
          fillShadowGradientToOpacity: 1,
          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
          style: {
            borderRadius: 16,
            paddingRight: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: DashboardColors.blue,
          },
        }}
        verticalLabelRotation={0}
        fromZero
        showValuesOnTopOfBars
        style={{
          marginVertical: 8,
          borderRadius: 16,
          marginLeft: -10,
        }}
      />
    </View>
  );
};

export default DailySalesChart;