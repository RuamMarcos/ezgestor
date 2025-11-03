import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, LayoutChangeEvent, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/context/ThemeContext';
import { getCashflowSeries, type CashflowPoint } from '@/services/FinancialService';
import { BarChart } from 'react-native-gifted-charts';

type TimeFrame = '7days' | '30days' | 'currentMonth' | '12months';

const TIMEFRAME_OPTIONS: ReadonlyArray<{ label: string; value: TimeFrame }> = [
  { label: 'Últimos 7 dias', value: '7days' },
  { label: 'Últimos 30 dias', value: '30days' },
  { label: 'Mês atual', value: 'currentMonth' },
  { label: 'Últimos 12 meses', value: '12months' },
];

interface ChartDataPoint {
  period: string;
  inflows: number;
  outflows: number;
  net: number;
}

const screenWidth = Dimensions.get('window').width;

const FinancialChart = () => {
  const { colors, isDark } = useTheme();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('12months');
  const [containerWidth, setContainerWidth] = useState<number>(screenWidth - 40);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getCashflowSeries(timeFrame);
        if (cancelled) return;
        const isFiniteNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
        const mapped: ChartDataPoint[] = (data as CashflowPoint[]).map((p) => ({
          period: String((p as any)?.period ?? '-'),
          inflows: isFiniteNumber((p as any)?.inflows) ? (p as any).inflows : 0,
          outflows: isFiniteNumber((p as any)?.outflows) ? (p as any).outflows : 0,
          net: isFiniteNumber((p as any)?.net) ? (p as any).net : 0,
        }));
        setChartData(mapped);
      } catch (e) {
        if (!cancelled) setChartData([]);
        console.error('Erro ao buscar série de fluxo de caixa (mobile):', e);
      }
    })();
    return () => { cancelled = true; };
  }, [timeFrame]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Ensure chart-kit always receives at least one data point to avoid crashes on Expo Go
  const safeData: ChartDataPoint[] = chartData.length > 0
    ? chartData
    : [{ period: '-', inflows: 0, outflows: 0, net: 0 }];

  const pickerDropdownTextColor = useMemo(() => {
    if (Platform.OS === 'android' && isDark) {
      return '#111827';
    }
    return colors.darkText;
  }, [isDark, colors.darkText]);

  const pickerBackgroundColor = useMemo(() => {
    if (isDark) {
      if (Platform.OS === 'web') {
        return '#111827';
      }
      return colors.card;
    }
    return colors.lightGray;
  }, [isDark, colors.card, colors.lightGray]);

  const totalInflows = chartData.reduce((sum, item) => sum + item.inflows, 0);
  const totalOutflows = chartData.reduce((sum, item) => sum + item.outflows, 0);
  const totalNet = chartData.reduce((sum, item) => sum + item.net, 0);

  // Compute dynamic bar width and scrollable chart content width
  const desiredVisibleBars = useMemo(() => (timeFrame === '12months' ? 12 : timeFrame === '7days' ? 7 : 12), [timeFrame]);
  const barSpacing = 6;
  const sidePadding = 48; // approximate space for axes/labels used by the chart
  const computedBarWidth = useMemo(() => {
    const numberOfBars = Math.max(1, safeData.length);
    // If we have few bars, expand bars to fill available width (no scroll)
    if (numberOfBars <= desiredVisibleBars) {
      const available = Math.max(0, containerWidth - sidePadding - (numberOfBars - 1) * barSpacing);
      const widthPerBar = Math.floor(available / numberOfBars);
      return Math.max(18, Math.min(64, widthPerBar));
    }
    // Otherwise, target a reasonable width per desired visible bars
    const maxWidthPerBar = Math.floor(containerWidth / Math.max(1, desiredVisibleBars));
    return Math.max(14, Math.min(34, maxWidthPerBar - barSpacing));
  }, [containerWidth, desiredVisibleBars, safeData.length]);
  const chartContentWidth = useMemo(() => {
    const numberOfBars = safeData.length;
    const contentBase = numberOfBars > 0
      ? numberOfBars * (computedBarWidth + barSpacing) - barSpacing + sidePadding
      : containerWidth;
    return Math.max(containerWidth, contentBase);
  }, [safeData.length, computedBarWidth, containerWidth]);

  // Axis labels: compress and optionally rotate
  const targetLabels = useMemo(() => (timeFrame === '12months' ? 12 : timeFrame === '7days' ? 7 : 10), [timeFrame]);
  const stride = useMemo(() => Math.max(1, Math.ceil(safeData.length / targetLabels)), [safeData.length, targetLabels]);
  const angle = useMemo(() => ((timeFrame === '30days' || timeFrame === 'currentMonth') ? -35 : 0), [timeFrame]);

  // Colors
  const colorInflows = '#10B981';
  const colorOutflows = '#F59E0B';
  const colorNet = '#8B5CF6';

  // Gifted Charts data: stacked bars + overlay line
  const stackData = useMemo(() => (
    safeData.map((p, idx) => ({
      label: idx % stride === 0 ? p.period : '',
      stacks: [
        { value: p.inflows, color: colorInflows },
        { value: p.outflows, color: colorOutflows },
      ],
    }))
  ), [safeData, stride]);

  const lineData = useMemo(() => (
    safeData.map(p => ({ value: Number.isFinite(p.net) ? p.net : 0 }))
  ), [safeData]);

  const maxStack = useMemo(() => (
    safeData.reduce((m, p) => Math.max(m, p.inflows + p.outflows, p.net), 0)
  ), [safeData]);
  const hasAtLeastTwoPoints = safeData.length >= 2;
  const chartKey = useMemo(() => `tf-${timeFrame}-${safeData.length}`, [timeFrame, safeData.length]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]} onLayout={onContainerLayout}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.darkText }]}>Entradas vs. Saídas</Text>
      </View>

  <View style={[styles.pickerContainer, { backgroundColor: pickerBackgroundColor, borderColor: colors.border }]}>
        <Picker
          key={`timeframe-${colors.darkText}`}
          mode="dropdown"
          selectedValue={timeFrame}
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          style={[styles.picker, { color: colors.darkText, backgroundColor: pickerBackgroundColor }]}
          itemStyle={{ color: pickerDropdownTextColor }}
          dropdownIconColor={colors.darkText}
        >
          {TIMEFRAME_OPTIONS.map(({ label, value }) => (
            <Picker.Item key={value} label={label} value={value} color={pickerDropdownTextColor} />
          ))}
        </Picker>
      </View>

      {/* Scrollable gifted-charts bar + line (overlay) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ width: chartContentWidth }}>
        <View style={{ width: chartContentWidth, paddingBottom: 12 }}>
          <BarChart
            key={chartKey}
            width={chartContentWidth}
            height={220}
            stackData={stackData}
            barWidth={computedBarWidth}
            spacing={barSpacing}
            yAxisTextStyle={{ color: colors.grayText, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.grayText, fontSize: 10, transform: [{ rotate: `${angle}deg` }] }}
            xAxisThickness={0.75}
            yAxisThickness={0.75}
            rulesType={'solid'}
            rulesColor={colors.border}
            noOfSections={5}
            maxValue={Math.max(1, Math.ceil(maxStack * 1.2))}
            showLine={hasAtLeastTwoPoints}
            lineData={lineData}
            lineConfig={{ color: colorNet, thickness: 3, curved: true, hideDataPoints: false, dataPointsWidth: 4, dataPointsColor: colorNet }}
            renderTooltip={(item: any, index: number) => {
              const p = safeData[index] || { period: '', inflows: 0, outflows: 0, net: 0 };
              return (
                <View style={{ backgroundColor: colors.card, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.darkText, fontWeight: '600', marginBottom: 4 }}>{p.period}</Text>
                  <Text style={{ color: colorInflows }}>Entradas: {formatCurrency(p.inflows)}</Text>
                  <Text style={{ color: colorOutflows }}>Saídas: {formatCurrency(p.outflows)}</Text>
                  <Text style={{ color: colorNet }}>Saldo: {formatCurrency(p.net)}</Text>
                </View>
              );
            }}
          />
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, backgroundColor: colorInflows, borderRadius: 2 }} />
          <Text style={{ color: colors.grayText, fontSize: 12 }}>Entradas</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, backgroundColor: colorOutflows, borderRadius: 2 }} />
          <Text style={{ color: colors.grayText, fontSize: 12 }}>Saídas</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 2, backgroundColor: colorNet }} />
          <Text style={{ color: colors.grayText, fontSize: 12 }}>Saldo</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.summaryLabel, { color: colors.grayText }]}>Entradas</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            {formatCurrency(totalInflows)}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.summaryLabel, { color: colors.grayText }]}>Saídas</Text>
          <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
            {formatCurrency(totalOutflows)}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.summaryLabel, { color: colors.grayText }]}>Líquido</Text>
          <Text style={[styles.summaryValue, { color: '#8B5CF6' }]}>
            {formatCurrency(totalNet)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  lineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FinancialChart;