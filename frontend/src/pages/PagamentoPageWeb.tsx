import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function PagamentoPage() {
  const [paymentMethod, setPaymentMethod] = useState<'boleto' | 'pix' | 'cartao'>('cartao');

  return (
    <div className="relative bg-gray-800 min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700"></div>

      <div className="relative w-full max-w-4xl bg-white shadow-xl rounded-lg flex">
        <div className="w-1/3 bg-gradient-to-b from-indigo-600 to-purple-800 p-8 text-white flex flex-col items-center justify-center rounded-l-lg">
          <h2 className="text-3xl font-bold">EzGestor</h2>
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full outline outline-1 outline-white/20">
            <div className="bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-full self-start inline-block">PLANO SELECIONADO</div>
            <p className="text-2xl font-bold mt-4">Plano Padrão</p>
            <p className="text-4xl font-bold mt-2">R$ 29</p>
            <p className="opacity-80">por mês</p>
            <div className="bg-green-600/20 text-green-300 text-sm font-medium text-center py-2 rounded-md mt-4">
              🎁 Grátis por 15 dias
            </div>
          </div>
        </div>

        <div className="w-2/3 p-8">
          <h1 className="text-3xl font-bold text-gray-800">Finalizar Cadastro</h1>
          <p className="text-md font-bold text-gray-800 mt-8">Escolha a forma de pagamento</p>

          <div className="flex space-x-4 mt-4">
            <button onClick={() => setPaymentMethod('cartao')} className={`flex-1 p-4 rounded-lg border-2 ${paymentMethod === 'cartao' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
              <span className="text-2xl">💳</span>
              <p className={`font-bold ${paymentMethod === 'cartao' ? 'text-indigo-600' : 'text-black'}`}>Cartão</p>
            </button>
            <button onClick={() => setPaymentMethod('pix')} className={`flex-1 p-4 rounded-lg border-2 ${paymentMethod === 'pix' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
              <span className="text-2xl">📱</span>
              <p className={`font-bold ${paymentMethod === 'pix' ? 'text-indigo-600' : 'text-black'}`}>PIX</p>
            </button>
            <button onClick={() => setPaymentMethod('boleto')} className={`flex-1 p-4 rounded-lg border-2 ${paymentMethod === 'boleto' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
              <span className="text-2xl">🧾</span>
              <p className={`font-bold ${paymentMethod === 'boleto' ? 'text-indigo-600' : 'text-black'}`}>Boleto</p>
            </button>
          </div>

          <div className="mt-6">
            {paymentMethod === 'cartao' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Número do Cartão</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full mt-1 p-3 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="text-sm font-medium text-gray-600">Validade</label>
                    <input type="text" placeholder="MM/AA" className="w-full mt-1 p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm font-medium text-gray-600">CVV</label>
                    <input type="text" placeholder="123" className="w-full mt-1 p-3 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome no Cartão</label>
                  <input type="text" placeholder="Como está no cartão" className="w-full mt-1 p-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
            )}
            {paymentMethod === 'pix' && (
                <div className="p-6 rounded-lg bg-sky-50 border border-sky-500 text-center">
                    <span className="text-4xl">📱</span>
                    <h3 className="text-lg font-bold text-sky-800 mt-2">Pagamento via PIX</h3>
                    <p className="text-sky-800 mt-2">Após confirmar, você receberá um QR Code para realizar o pagamento instantâneo via PIX.</p>
                </div>
            )}
            {paymentMethod === 'boleto' && (
                <div className="p-6 rounded-lg bg-amber-50 border border-amber-500 text-center">
                    <span className="text-4xl">🧾</span>
                    <h3 className="text-lg font-bold text-amber-800 mt-2">Pagamento via Boleto</h3>
                    <p className="text-amber-800 mt-2">O boleto será gerado após a confirmação e poderá ser pago em qualquer banco, lotérica ou via internet banking.</p>
                    <p className="font-bold text-amber-800 mt-4">Vencimento: 3 dias úteis</p>
                </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center">
                <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500"/>
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    Li e aceito os <a href="#" className="text-indigo-600">Termos de Uso</a> e a <a href="#" className="text-indigo-600">Política de Privacidade</a>.
                </label>
            </div>
            <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
              Finalizar Cadastro
            </button>
            <Link to="/planos" className="w-full block text-center border-2 border-indigo-600 text-indigo-600 font-medium py-3 rounded-lg hover:bg-indigo-50 transition-colors">
              Alterar Plano
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PagamentoPage;