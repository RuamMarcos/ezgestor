import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface CompanyData {
  id: number;
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
  email_principal: string;
  logotipo: string;
}

interface ICompanyForm extends Omit<CompanyData, 'logotipo' | 'id'> {
  logotipo: File | null;
}

const CompanyProfilePage = () => {
  const { refreshFromServer } = useAuth();
  const [formData, setFormData] = useState<ICompanyForm>({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
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
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/accounts/profile/empresa/');
        const empresa: CompanyData = response.data;
        
        setFormData({
          nome_fantasia: empresa.nome_fantasia || '',
          razao_social: empresa.razao_social || '',
          cnpj: empresa.cnpj || '',
          inscricao_estadual: empresa.inscricao_estadual || '',
          endereco: empresa.endereco || '',
          cep: empresa.cep || '',
          bairro: empresa.bairro || '',
          cidade: empresa.cidade || '',
          estado: empresa.estado || '',
          pais: empresa.pais || 'Brasil',
          telefone: empresa.telefone || '',
          email_principal: empresa.email_principal || '',
          logotipo: null,
        });
        
        if (empresa.logotipo) {
          // Constrói a URL completa para o logotipo
          const logoUrl = `http://127.0.0.1:8000${empresa.logotipo}`;
          setLogoPreview(logoUrl);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        alert('Falha ao carregar os dados da empresa.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

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

    dataToSubmit.append('nome_fantasia', formData.nome_fantasia);
    dataToSubmit.append('razao_social', formData.razao_social);
    dataToSubmit.append('cnpj', formData.cnpj);
    dataToSubmit.append('inscricao_estadual', formData.inscricao_estadual);
    dataToSubmit.append('endereco', formData.endereco);
    dataToSubmit.append('cep', formData.cep);
    dataToSubmit.append('bairro', formData.bairro);
    dataToSubmit.append('cidade', formData.cidade);
    dataToSubmit.append('estado', formData.estado);
    dataToSubmit.append('pais', formData.pais);
    dataToSubmit.append('telefone', formData.telefone);
    dataToSubmit.append('email_principal', formData.email_principal);
    
    if (formData.logotipo) {
      dataToSubmit.append('logotipo', formData.logotipo);
    }

    try {
      await api.patch('/accounts/profile/empresa/', dataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshFromServer();
      alert('Dados da empresa atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      alert('Falha ao atualizar os dados. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Perfil da Empresa</h2>
        <p className="text-sm text-gray-500">
          Gerencie as informações da sua empresa.
        </p>
      </div>
      <div className="space-y-8">
        {/* Seção de Identificação da Empresa */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Identificação da Empresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna do Logotipo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Pré-visualização do Logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400">Logo</span>
                )}
              </div>
              <label
                htmlFor="logo-upload"
                className="cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Enviar Novo Logo
              </label>
              <input
                id="logo-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
              />
              <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
            </div>

            {/* Coluna de Nome Fantasia e Razão Social */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nome_fantasia"
                  className="block text-sm font-medium text-gray-600"
                >
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  id="nome_fantasia"
                  name="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="razao_social"
                  className="block text-sm font-medium text-gray-600"
                >
                  Razão Social
                </label>
                <input
                  type="text"
                  id="razao_social"
                  name="razao_social"
                  value={formData.razao_social}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
            </div>

            {/* Coluna de CNPJ e Inscrição */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="cnpj"
                  className="block text-sm font-medium text-gray-600"
                >
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="inscricao_estadual"
                  className="block text-sm font-medium text-gray-600"
                >
                  Inscrição Estadual/Municipal
                </label>
                <input
                  type="text"
                  id="inscricao_estadual"
                  name="inscricao_estadual"
                  value={formData.inscricao_estadual}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Endereço e Contato */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Endereço e Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna 1 */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="endereco"
                  className="block text-sm font-medium text-gray-600"
                >
                  Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="cep"
                  className="block text-sm font-medium text-gray-600"
                >
                  CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
            </div>
            {/* Coluna 2 */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bairro"
                  className="block text-sm font-medium text-gray-600"
                >
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="cidade"
                  className="block text-sm font-medium text-gray-600"
                >
                  Cidade
                </label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
            </div>
            {/* Coluna 3 */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="estado"
                  className="block text-sm font-medium text-gray-600"
                >
                  Estado
                </label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="pais"
                  className="block text-sm font-medium text-gray-600"
                >
                  País
                </label>
                <input
                  type="text"
                  id="pais"
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                />
              </div>
            </div>
          </div>

          {/* Linha adicional para Telefone e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-600"
              >
                Telefone
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="email_principal"
                className="block text-sm font-medium text-gray-600"
              >
                E-mail Principal
              </label>
              <input
                type="email"
                id="email_principal"
                name="email_principal"
                value={formData.email_principal}
                onChange={handleChange}
                placeholder="contato@empresa.com"
                className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};

export default CompanyProfilePage;