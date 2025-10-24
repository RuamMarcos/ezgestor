import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import type { CompanyData, ICompanyForm } from '../types/company';

export const useCompanyForm = () => {
  const { user, refreshFromServer } = useAuth();
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
    if (user?.empresa) {
      const empresa: CompanyData = user.empresa;
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
        email_principal: empresa.email_contato || '',
        logotipo: null,
      });
      
      if (empresa.logotipo_url) {
        const logoUrl = `http://127.0.0.1:8000${empresa.logotipo_url}`;
        setLogoPreview(logoUrl);
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

    Object.keys(formData).forEach(key => {
      const formKey = key as keyof ICompanyForm;
      if (formKey === 'logotipo' && formData.logotipo) {
        dataToSubmit.append('logotipo', formData.logotipo);
      } else if (formKey === 'email_principal') {
        dataToSubmit.append('email_contato', formData.email_principal);
      } else if (formKey !== 'logotipo') {
        dataToSubmit.append(formKey, formData[formKey] as string);
      }
    });

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

  return {
    formData,
    logoPreview,
    isLoading,
    handleChange,
    handleFileChange,
    handleSubmit,
  };
};
