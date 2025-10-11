import React from 'react';

const FinancialChart = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Visão Geral do Mês</h3>
      <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Gráfico de Entradas vs. Saídas</p>
          <p className="text-sm text-gray-400 mt-1">(Componente de gráfico a ser implementado)</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;