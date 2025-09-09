import React, { useState } from 'react';
import { aplicarMascaraCnpj, aplicarMascaraTelefone } from "../utils/masks";


interface FormData {
  nomeEmpresa: string;
  cnpj: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export const PaginaCadastro: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: '',
    cnpj: '',
    nomeCompleto: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let valorFormatado = value;
    if (name === 'cnpj') {
      valorFormatado = aplicarMascaraCnpj(value);
    } else if (name === 'telefone') {
      valorFormatado = aplicarMascaraTelefone(value);
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: valorFormatado,
    }));
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    if (formData.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    console.log('Dados do formulário a serem enviados:', formData);
    alert('Conta criada com sucesso! (Simulação)\nRedirecionando para a próxima etapa...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 font-sans">
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-10 shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                <nav className="flex justify-center items-center h-20">
                <a href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-900 no-underline">
                    <img src="/src/assets/logo.png" alt="Logo EzGestor" className="w-20 h-20" />
                </a>
                </nav>
            </div>
        </header>

      <main className="flex items-center justify-center min-h-screen pt-24 pb-10 px-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-10">
            Crie sua Conta e Cadastre sua Empresa
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Campos do Formulário */}
              <div className="space-y-2">
                <label htmlFor="nomeEmpresa" className="block font-medium text-gray-700">Nome Fantasia da Empresa</label>
                <input type="text" id="nomeEmpresa" name="nomeEmpresa" placeholder="Nome da sua empresa" value={formData.nomeEmpresa} onChange={handleChange} required 
                       className="w-full p-4 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"/>
              </div>
              <div className="space-y-2">
                <label htmlFor="cnpj" className="block font-medium text-gray-700">CNPJ</label>
                <input type="text" id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" value={formData.cnpj} onChange={handleChange} required 
                       className="w-full p-4 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"/>
              </div>
              <div className="space-y-2">
                <label htmlFor="nomeCompleto" className="block font-medium text-gray-700">Seu Nome Completo (Administrador)</label>
                <input type="text" id="nomeCompleto" name="nomeCompleto" placeholder="Seu nome completo" value={formData.nomeCompleto} onChange={handleChange} required 
                       className="w-full p-4 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"/>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block font-medium text-gray-700">Seu E-mail de Acesso</label>
                <input type="email" id="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required
                       className="w-full p-4 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"/>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="telefone" className="block font-medium text-gray-700">Telefone / WhatsApp</label>
                <input type="tel" id="telefone" name="telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleChange} required
                       className="w-full p-4 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"/>
              </div>
              <div className="space-y-2">
                <label htmlFor="senha">Senha</label>
                <input type="password" id="senha" name="senha" placeholder="Mínimo 6 caracteres" value={formData.senha} onChange={handleChange} required
                       className="w-full p-4 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"/>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmarSenha">Confirmar Senha</label>
                <input type="password" id="confirmarSenha" name="confirmarSenha" placeholder="Confirme sua senha" value={formData.confirmarSenha} onChange={handleChange} required
                       className="w-full p-4 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"/>
              </div>
            </div>

            <button type="submit" className="w-full mt-8 p-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
              Criar Conta e Avançar
            </button>
          </form>

          <div className="text-center mt-6 text-gray-600">
            <p>Já tem uma conta?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:underline">
                Faça login
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};