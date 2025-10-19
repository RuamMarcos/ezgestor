import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCashflowSeries, type CashflowPoint } from '../../services/financialService';

type TimeFrame = '7days' | '30days' | 'currentMonth' | '12months';

interface ChartDataPoint {
  period: string;
  inflows: number;
  outflows: number;
  net: number;
}

const FinancialChart = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('12months');

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const data = await getCashflowSeries(timeFrame);
        if (isCancelled) return;
        const mapped: ChartDataPoint[] = (data as CashflowPoint[]).map(p => ({
          period: p.period,
          inflows: p.inflows,
          outflows: p.outflows,
          net: p.net,
        }));
        setChartData(mapped);
      } catch (e) {
        // fallback to empty
        if (!isCancelled) setChartData([]);
        console.error('Erro ao buscar série de fluxo de caixa:', e);
      }
    })();
    return () => { isCancelled = true; };
  }, [timeFrame]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatYAxis = (value: number): string => {
    if (Math.abs(value) >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Entradas vs. Saídas</h3>
        
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="7days">Últimos 7 dias</option>
          <option value="30days">Últimos 30 dias</option>
          <option value="currentMonth">Mês atual</option>
          <option value="12months">Últimos 12 meses</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="period" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            angle={timeFrame === '30days' ? -45 : 0}
            textAnchor={timeFrame === '30days' ? 'end' : 'middle'}
            height={timeFrame === '30days' ? 60 : 30}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            tick={{ fill: '#6B7280' }} 
            width={70}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="rect"
          />
          <Bar 
            dataKey="inflows" 
            fill="#10B981" 
            name="Entradas" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar 
            dataKey="outflows" 
            fill="#F59E0B" 
            name="Saídas" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Line 
            type="monotone" 
            dataKey="net" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            name="Saldo Líquido"
            dot={{ fill: '#8B5CF6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-green-600 font-medium mb-1">Total de Entradas</p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.inflows, 0))}
          </p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-xs text-orange-600 font-medium mb-1">Total de Saídas</p>
          <p className="text-lg font-bold text-orange-700">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.outflows, 0))}
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-purple-600 font-medium mb-1">Saldo Líquido</p>
          <p className="text-lg font-bold text-purple-700">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.net, 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;