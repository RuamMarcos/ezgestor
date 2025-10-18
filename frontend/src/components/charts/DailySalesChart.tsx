import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  date: string;
  total: number;
}

interface DailySalesChartProps {
  data: ChartData[];
  loading: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const DailySalesChart: React.FC<DailySalesChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Carregando dados do gráfico...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Não há dados de vendas para exibir.</p>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    // Formata a data para "dd/MM" para o eixo X
    shortDate: format(new Date(item.date), 'dd/MM'),
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart
        data={formattedData}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="shortDate" tick={{ fill: '#6B7280' }} />
        <YAxis tickFormatter={(value) => `R$ ${value}`} tick={{ fill: '#6B7280' }} width={80} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Total']}
          labelStyle={{ color: '#333' }}
          itemStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="total" fill="#3B82F6" name="Total de Vendas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailySalesChart;