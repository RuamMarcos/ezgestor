// frontend/src/pages/PlanosPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';

function PlanosPage() {
  return (
    // Fundo da página com gradiente escuro
    <div className="relative bg-gray-800 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700 opacity-90"></div>
      
      {/* Container branco principal */}
      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-6 sm:p-12">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Assine o Plano Ideal para Seu Negócio</h1>
          <p className="mt-4 text-lg text-gray-600">Gerencie suas vendas, estoque e finanças de forma simples e eficiente</p>
        </div>
        
        <div className="flex justify-center mt-12">
          {/* Card do Plano Padrão (mais largo) */}
          <div className="w-full max-w-2xl bg-gradient-to-b from-indigo-600 to-purple-800 rounded-2xl p-12 flex flex-col text-white relative overflow-hidden">
            
            {/* Banner "Mais Popular" */}
            <div className="absolute top-[-1px] right-[-1px] w-40 h-40 overflow-hidden">
                <div className="absolute top-[42px] right-[-45px] w-[220px] transform rotate-45 bg-red-500 text-center text-white font-semibold py-1.5">
                    Mais Popular
                </div>
            </div>

            <h2 className="text-3xl font-bold text-center">Plano Padrão</h2>
            <p className="text-6xl font-bold text-center mt-4">R$ 29,99</p>
            <p className="text-center opacity-80 text-lg">por mês</p>

            <ul className="mt-10 space-y-4 text-lg self-center">
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Dashboard completo com gráficos</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Vendas ilimitadas</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Gestão completa de estoque</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Controle de fluxo de caixa</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Emissão de NFe</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Múltiplos usuários</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Relatórios avançados</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-3 text-2xl">✓</span> Formas de pagamento (PIX/Dinheiro)</li>
            </ul>

            <Link to="/pagamento" className="bg-white text-indigo-700 rounded-full py-4 mt-12 font-bold text-center text-xl hover:bg-gray-200 transition-colors shadow-lg">
              Assinar Plano Padrão
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>💡 Cancele a qualquer momento • Sem taxas de cancelamento</p>
        </div>
      </div>
    </div>
  );
}

export default PlanosPage;