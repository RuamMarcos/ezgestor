import React from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors } = useTheme();

  if (loading) {
    return <ActivityIndicator size="large" color={colors.headerBlue} style={{ marginVertical: 40 }} />;
  }

  if (!data || data.length === 0) {
    return <Text style={{ textAlign: 'center', marginVertical: 40, color: colors.grayText }}>Sem dados de vendas.</Text>;
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
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74, 85, 225, ${opacity})`,
          barPercentage: 1.0,
          barRadius: 5,
          fillShadowGradientFrom: colors.headerBlue,
          fillShadowGradientFromOpacity: 1,
          fillShadowGradientTo: colors.headerBlue,
          fillShadowGradientToOpacity: 1,
          labelColor: (opacity = 1) => `rgba(108, 117, 125, ${opacity})`,
          style: {
            borderRadius: 16,
            paddingRight: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: colors.headerBlue,
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