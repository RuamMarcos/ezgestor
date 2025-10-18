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

  const chartData = {
    labels: data.map(item => format(new Date(item.date), 'dd/MM')),
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
        width={screenWidth - 32} // Largura da tela menos o padding do container
        height={220}
        yAxisLabel="R$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Azul
          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // Cinza
          style: {
            borderRadius: 16,
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
        }}
      />
    </View>
  );
};

export default DailySalesChart;