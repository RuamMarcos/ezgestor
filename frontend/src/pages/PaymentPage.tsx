import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { aplicarMascaraCartao, aplicarMascaraValidade, aplicarMascaraCvv } from '../utils/masks';
import api from '../api';

function PagamentoPage() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'boleto' | 'pix' | 'cartao'>('cartao');
  
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    validade: '',
    cvv: '',
    nome: ''
  });

  const handleChangeCartao = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let valorFormatado = value;
    if (name === 'numero') {
      valorFormatado = aplicarMascaraCartao(value);
    } else if (name === 'validade') {
      valorFormatado = aplicarMascaraValidade(value);
    } else if (name === 'cvv') {
      valorFormatado = aplicarMascaraCvv(value);
    }
    
    setDadosCartao(prevState => ({
      ...prevState,
      [name]: valorFormatado,
    }));
  };


  const handleConfirmarPagamento = async () => { 
    if (paymentMethod === 'cartao') {
      if (!dadosCartao.numero || !dadosCartao.validade || !dadosCartao.cvv || !dadosCartao.nome) {
        alert('Por favor, preencha todos os dados do cartão.');
        return;
      }
    }
    
    try {
      const planoId = 1; 
      
      await api.post('/accounts/payment/process/', {
        plano_id: planoId,
        metodo: paymentMethod,
      });

      // Se a requisição for bem-sucedida, navega para o dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Não foi possível finalizar a assinatura. Tente novamente.");
    }
  };

  return (
    <div className="relative bg-gray-800 min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700"></div>

      <div className="relative w-full max-w-4xl bg-white shadow-xl rounded-lg flex flex-col lg:flex-row">
        {/* Sidebar com plano - oculta em mobile, mostra como card no topo */}
        <div className="lg:w-1/3 bg-gradient-to-b from-indigo-600 to-purple-800 p-6 lg:p-8 text-white flex flex-col items-center justify-center rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
          <h2 className="text-2xl lg:text-3xl font-bold">EzGestor</h2>
          <div className="mt-4 lg:mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 lg:p-6 w-full outline outline-1 outline-white/20">
            <div className="bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-full self-start inline-block">PLANO SELECIONADO</div>
            <p className="text-xl lg:text-2xl font-bold mt-3 lg:mt-4">Plano Padrão</p>
            <p className="text-3xl lg:text-4xl font-bold mt-1 lg:mt-2">R$ 29</p>
            <p className="opacity-80 text-sm lg:text-base">por mês</p>
            <div className="bg-green-600/20 text-green-300 text-xs lg:text-sm font-medium text-center py-2 rounded-md mt-3 lg:mt-4">
              🎁 Grátis por 15 dias
            </div>
          </div>
        </div>

        <div className="flex-1 lg:w-2/3 p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Finalizar Cadastro</h1>
          <p className="text-sm sm:text-md font-bold text-gray-800 mt-4 sm:mt-6 lg:mt-8">Escolha a forma de pagamento</p>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <button onClick={() => setPaymentMethod('cartao')} className={`p-2 sm:p-4 rounded-lg border-2 text-center ${paymentMethod === 'cartao' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
              <span className="text-xl sm:text-2xl">💳</span>
              <p className={`font-bold text-xs sm:text-base ${paymentMethod === 'cartao' ? 'text-indigo-600' : 'text-black'}`}>Cartão</p>
            </button>
            <button onClick={() => setPaymentMethod('pix')} className={`p-2 sm:p-4 rounded-lg border-2 text-center ${paymentMethod === 'pix' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
              <span className="text-xl sm:text-2xl">📱</span>
              <p className={`font-bold text-xs sm:text-base ${paymentMethod === 'pix' ? 'text-indigo-600' : 'text-black'}`}>PIX</p>
            </button>
            <button onClick={() => setPaymentMethod('boleto')} className={`p-2 sm:p-4 rounded-lg border-2 text-center ${paymentMethod === 'boleto' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
              <span className="text-xl sm:text-2xl">🧾</span>
              <p className={`font-bold text-xs sm:text-base ${paymentMethod === 'boleto' ? 'text-indigo-600' : 'text-black'}`}>Boleto</p>
            </button>
          </div>

          <div className="mt-4 sm:mt-6">
            {paymentMethod === 'cartao' && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Número do Cartão</label>
                  <input 
                    type="text" 
                    name="numero"
                    placeholder="0000 0000 0000 0000" 
                    className="w-full mt-1 p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base" 
                    value={dadosCartao.numero}
                    onChange={handleChangeCartao}
                  />
                </div>
                <div className="flex space-x-2 sm:space-x-4">
                  <div className="w-1/2">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Validade</label>
                    <input 
                      type="text" 
                      name="validade"
                      placeholder="MM/AA" 
                      className="w-full mt-1 p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base" 
                      value={dadosCartao.validade}
                      onChange={handleChangeCartao}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">CVV</label>
                    <input 
                      type="text" 
                      name="cvv"
                      placeholder="123" 
                      className="w-full mt-1 p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base" 
                      value={dadosCartao.cvv}
                      onChange={handleChangeCartao}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Nome no Cartão</label>
                  <input 
                    type="text" 
                    name="nome"
                    placeholder="Como está no cartão" 
                    className="w-full mt-1 p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base" 
                    value={dadosCartao.nome}
                    onChange={handleChangeCartao}
                  />
                </div>
              </div>
            )}
            {paymentMethod === 'pix' && (
                <div className="p-4 sm:p-6 rounded-lg bg-sky-50 border border-sky-500 text-center">
                    <span className="text-3xl sm:text-4xl">📱</span>
                    <h3 className="text-base sm:text-lg font-bold text-sky-800 mt-2">Pagamento via PIX</h3>
                    <p className="text-sky-800 mt-2 text-sm sm:text-base">Após confirmar, você receberá um QR Code para realizar o pagamento instantâneo via PIX.</p>
                </div>
            )}
            {paymentMethod === 'boleto' && (
                <div className="p-4 sm:p-6 rounded-lg bg-amber-50 border border-amber-500 text-center">
                    <span className="text-3xl sm:text-4xl">🧾</span>
                    <h3 className="text-base sm:text-lg font-bold text-amber-800 mt-2">Pagamento via Boleto</h3>
                    <p className="text-amber-800 mt-2 text-sm sm:text-base">O boleto será gerado após a confirmação e poderá ser pago em qualquer banco, lotérica ou via internet banking.</p>
                    <p className="font-bold text-amber-800 mt-3 sm:mt-4 text-sm sm:text-base">Vencimento: 3 dias úteis</p>
                </div>
            )}
          </div>

          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
            <div className="flex items-start sm:items-center">
                <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500 mt-0.5 sm:mt-0"/>
                <label htmlFor="terms" className="ml-2 text-xs sm:text-sm text-gray-600">
                    Li e aceito os <a href="#" className="text-indigo-600">Termos de Uso</a> e a <a href="#" className="text-indigo-600">Política de Privacidade</a>.
                </label>
            </div>
            <button 
              onClick={handleConfirmarPagamento}
              className="w-full bg-green-600 text-white font-bold py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Finalizar Cadastro
            </button>
            <Link to="/planos" className="w-full block text-center border-2 border-indigo-600 text-indigo-600 font-medium py-2.5 sm:py-3 rounded-lg hover:bg-indigo-50 transition-colors text-sm sm:text-base">
              Alterar Plano
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PagamentoPage;