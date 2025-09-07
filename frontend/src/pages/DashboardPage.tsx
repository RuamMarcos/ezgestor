import React, { useState } from 'react';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';

interface Sale {
  id: number;
  clientName: string;
  description: string;
  value: number;
}

interface DashboardData {
  monthlyRevenue: number;
  salesCount: number;
  lowStockItems: number;
  estimatedProfit: number;
  recentSales: Sale[];
}

const staticDashboardData: DashboardData = {
  monthlyRevenue: 8450.50,
  salesCount: 127,
  lowStockItems: 23,
  estimatedProfit: 2890.00,
  recentSales: [
    { id: 1, clientName: "João Silva", description: "Camiseta Polo", value: 45.00 },
    { id: 2, clientName: "Maria Santos", description: "Tênis Esportivo", value: 120.00 },
    { id: 3, clientName: "Carlos Souza", description: "Mochila Executiva", value: 85.00 },
    { id: 4, clientName: "Ana Pereira", description: "Boné Aba Reta", value: 35.00 }
  ]
};

interface NavItem {
  id: string;
  label: string;
  active?: boolean;
}

function DashboardPage() {
  const [data] = useState<DashboardData>(staticDashboardData);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', active: true },
    { id: 'vendas', label: 'Vendas' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'fluxo', label: 'Fluxo de Caixa' }
  ];

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <div className="w-full mx-auto">
        
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">EzGestor</h1>
            
            <div className="flex bg-gray-100 rounded-full p-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Geral</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Receita Mensal" 
              value={formatCurrency(data.monthlyRevenue)}
              gradient="bg-gradient-to-r from-orange-400 to-pink-400"
            />
            <StatCard 
              title="Vendas Este Mês" 
              value={data.salesCount.toString()}
              gradient="bg-gradient-to-r from-pink-300 to-orange-300"
            />
            <StatCard 
              title="Produtos em Estoque Baixo" 
              value={data.lowStockItems.toString()}
              gradient="bg-gradient-to-r from-purple-200 to-pink-200"
              textColor="text-gray-700"
            />
            <StatCard 
              title="Lucro Estimado" 
              value={formatCurrency(data.estimatedProfit)}
              gradient="bg-gradient-to-r from-cyan-400 to-blue-400"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas dos Últimos 7 Dias</h3>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl h-64 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <div className="text-gray-800 text-lg font-medium">Gráfico de Vendas Diárias</div>
                <div className="text-gray-600 text-sm mt-2">Visualização em desenvolvimento</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg">
              Nova Venda
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg">
              Gerar Relatório
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg">
              Emitir NF-e
            </button>
          </div>

          <div className="mt-8 bg-white rounded-2xl p-6 hidden lg:block border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas Recentes</h3>
            <div className="space-y-3">
              {data.recentSales.map(sale => (
                <div key={sale.id} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">{sale.clientName}</p>
                    <p className="text-sm text-gray-600">{sale.description}</p>
                  </div>
                  <p className="font-semibold text-gray-800">{formatCurrency(sale.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1800px] mx-auto mt-4">
        <Footer />
      </div>
    </div>
  );
}

export default DashboardPage;