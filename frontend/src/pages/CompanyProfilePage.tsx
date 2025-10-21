// src/pages/CompanyProfilePage.tsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// Interface para os dados da empresa vindos da API
interface CompanyData {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  inscricao_estadual: string;
  endereco: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  telefone: string;
  email_contato: string; // Corrigido para corresponder ao modelo do backend
  logotipo_url: string;
}

// Interface para o formulário, permitindo que o logotipo seja um File
interface ICompanyForm extends Omit<CompanyData, 'logotipo_url' | 'cnpj' | 'email_contato'> {
  logotipo: File | null;
  email_principal: string; // Mantido como no formulário original
}

const CompanyProfilePage = () => {
  const { user, refreshFromServer } = useAuth();
  const [formData, setFormData] = useState<ICompanyForm>({
    nome_fantasia: '',
    razao_social: '',
    inscricao_estadual: '',
    endereco: '',
    cep: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    telefone: '',
    email_principal: '',
    logotipo: null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cnpj, setCnpj] = useState('');

  useEffect(() => {
    if (user?.empresa) {
      const empresa: CompanyData = user.empresa;
      setFormData({
        nome_fantasia: empresa.nome_fantasia || '',
        razao_social: empresa.razao_social || '',
        inscricao_estadual: empresa.inscricao_estadual || '',
        endereco: empresa.endereco || '',
        cep: empresa.cep || '',
        bairro: empresa.bairro || '',
        cidade: empresa.cidade || '',
        estado: empresa.estado || '',
        pais: empresa.pais || 'Brasil',
        telefone: empresa.telefone || '',
        email_principal: empresa.email_contato || '',
        logotipo: null,
      });
      setCnpj(empresa.cnpj || '');
      if (empresa.logotipo_url) {
        setLogoPreview(empresa.logotipo_url);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, logotipo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSubmit = new FormData();

    // Mapeia os campos do formulário para os nomes esperados pela API
    dataToSubmit.append('empresa.nome_fantasia', formData.nome_fantasia);
    dataToSubmit.append('empresa.razao_social', formData.razao_social);
    dataToSubmit.append('empresa.inscricao_estadual', formData.inscricao_estadual);
    dataToSubmit.append('empresa.endereco', formData.endereco);
    dataToSubmit.append('empresa.cep', formData.cep);
    dataToSubmit.append('empresa.bairro', formData.bairro);
    dataToSubmit.append('empresa.cidade', formData.cidade);
    dataToSubmit.append('empresa.estado', formData.estado);
    dataToSubmit.append('empresa.pais', formData.pais);
    dataToSubmit.append('empresa.telefone', formData.telefone);
    dataToSubmit.append('empresa.email_contato', formData.email_principal);
    
    if (formData.logotipo) {
      dataToSubmit.append('empresa.logotipo', formData.logotipo);
    }

    try {
      await api.patch('/accounts/profile/', dataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshFromServer(); // Atualiza os dados no AuthContext
      alert('Dados da empresa atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      alert('Falha ao atualizar os dados. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm max-w-4xl mx-auto">
      {/* Cabeçalho com Breadcrumb */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">Configurações &gt; Perfil da Empresa</p>
        <h1 className="text-2xl font-bold text-gray-800">Perfil da Empresa</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Bloco de Identificação */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Identificação da Empresa</h3>
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Logo */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Logotipo</label>
                <div className="flex flex-col items-start gap-4">
                  <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <span>Enviar Novo Logo</span>
                      <input id="file-upload" name="logotipo" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG até 2MB</p>
                  </div>
                </div>
              </div>
              {/* Campos de Identificação */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nome_fantasia" className="block text-sm font-medium text-gray-700">Nome Fantasia</label>
                  <input type="text" name="nome_fantasia" id="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
                </div>
                <div>
                  <label htmlFor="razao_social" className="block text-sm font-medium text-gray-700">Razão Social</label>
                  <input type="text" name="razao_social" id="razao_social" value={formData.razao_social} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
                </div>
                <div>
                  <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                  <input type="text" name="cnpj" id="cnpj" value={cnpj} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed" />
                </div>
                 <div>
                  <label htmlFor="inscricao_estadual" className="block text-sm font-medium text-gray-700">Inscrição Estadual/Municipal</label>
                  <input type="text" name="inscricao_estadual" id="inscricao_estadual" value={formData.inscricao_estadual} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco de Endereço e Contato */}
         <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Endereço e Contato</h3>
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12">
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">Endereço</label>
                  <input type="text" name="endereco" id="endereco" placeholder="Rua das Flores, 123" value={formData.endereco} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-4">
                  <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                  <input type="text" name="cep" id="cep" placeholder="77001-000" value={formData.cep} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-8">
                  <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro</label>
                  <input type="text" name="bairro" id="bairro" placeholder="Centro" value={formData.bairro} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-6">
                  <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
                  <input type="text" name="cidade" id="cidade" placeholder="Palmas" value={formData.cidade} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-3">
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                  <input type="text" name="estado" id="estado" placeholder="Tocantins" value={formData.estado} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
              </div>
              <div className="md:col-span-3">
                  <label htmlFor="pais" className="block text-sm font-medium text-gray-700">País</label>
                  <input type="text" name="pais" id="pais" value={formData.pais} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed" />
              </div>
              <div className="md:col-span-6">
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone de Contato</label>
                  <input type="text" name="telefone" id="telefone" placeholder="(63) 99999-9999" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-6">
                  <label htmlFor="email_principal" className="block text-sm font-medium text-gray-700">E-mail Principal</label>
                  <input type="email" name="email_principal" id="email_principal" placeholder="contato@lojadoze.com" value={formData.email_principal} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
            <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm">
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfilePage;