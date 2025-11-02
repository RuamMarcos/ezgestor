import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import {
  aplicarMascaraCep,
  aplicarMascaraCnpj,
  aplicarMascaraTelefone,
} from '@/utils/masks';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { createStyles } from '@/styles/settings/CompanyProfileStyles';

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
  logotipo: { uri: string; name: string; type: string } | null;
}

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { user, refreshFromServer } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
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
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await api.get('/accounts/profile/empresa/');
        const empresa: CompanyData = response.data;

        setFormData({
          nome_fantasia: empresa.nome_fantasia || '',
          razao_social: empresa.razao_social || '',
          cnpj: aplicarMascaraCnpj(empresa.cnpj || ''),
          inscricao_estadual: empresa.inscricao_estadual || '',
          endereco: empresa.endereco || '',
          cep: aplicarMascaraCep(empresa.cep || ''),
          bairro: empresa.bairro || '',
          cidade: empresa.cidade || '',
          estado: empresa.estado || '',
          pais: empresa.pais || 'Brasil',
          telefone: aplicarMascaraTelefone(empresa.telefone || ''),
          email_principal: user?.email || '',
          logotipo: null,
        });

        if (empresa.logotipo) {
          setLogoPreview(resolveMediaUrl(empresa.logotipo));
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        setToast({ message: 'Falha ao carregar os dados.', type: 'error' });
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleChange = (name: keyof ICompanyForm, value: string) => {
    let maskedValue = value;
    if (name === 'cep') maskedValue = aplicarMascaraCep(value);
    else if (name === 'telefone') maskedValue = aplicarMascaraTelefone(value);
    else if (name === 'cnpj') maskedValue = aplicarMascaraCnpj(value);

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderInput = (
    label: string,
    name: keyof ICompanyForm,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'email-address' = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[name] ? styles.inputError : null]}
        value={formData[name] as string}
        onChangeText={text => handleChange(name, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={colors.grayText}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name]}</Text>}
    </View>
  );

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Reduce quality to avoid large files
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const filename = file.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      console.log('Imagem selecionada:', { uri: file.uri, name: filename, type });

      setLogoPreview(file.uri);
      setFormData(prev => ({
        ...prev,
        logotipo: { uri: file.uri, name: filename, type },
      }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (formData.cnpj && formData.cnpj.length < 18) newErrors.cnpj = 'CNPJ inválido.';
    if (formData.cep && formData.cep.length < 9) newErrors.cep = 'CEP inválido.';
    if (formData.telefone && formData.telefone.length < 15) newErrors.telefone = 'Telefone inválido.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const dataToSubmit = new FormData();

    // Add all form fields except logotipo
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'logotipo' && value) {
        const unmaskedValue = ['cnpj', 'cep', 'telefone'].includes(key)
          ? (value as string).replace(/\D/g, '')
          : value;
        dataToSubmit.append(key, unmaskedValue as string);
      }
    });
    
    // Add image file if present
    if (formData.logotipo) {
      // React Native FormData requires this specific format for file uploads
      const fileData: any = {
        uri: formData.logotipo.uri,
        name: formData.logotipo.name,
        type: formData.logotipo.type,
      };
      
      console.log('Enviando arquivo:', fileData);
      dataToSubmit.append('logotipo', fileData);
    }

    try {
      console.log('Enviando dados para o servidor...');
      // Note: Don't set Content-Type manually for FormData in React Native
      // Axios will set it automatically with the correct boundary
      const response = await api.patch('/accounts/profile/empresa/', dataToSubmit);
      console.log('Resposta do servidor:', response.data);
      await refreshFromServer();
      setToast({ message: 'Dados da empresa atualizados!', type: 'success' });
      setErrors({});
    } catch (error: any) {
      console.error('Erro ao atualizar dados:', error);
      console.error('Status:', error.response?.status);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Headers da requisição:', error.config?.headers);
      setToast({ 
        message: error.response?.data?.message || 'Falha ao atualizar os dados.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.headerBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.headerBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil da Empresa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação da Empresa</Text>
          <View style={styles.logoContainer}>
            <Image
              source={logoPreview ? { uri: logoPreview } : require('@/assets/images/white-logo.png')}
              style={styles.logo}
            />
            <TouchableOpacity style={styles.logoButton} onPress={handleImagePick}>
              <Text style={styles.logoButtonText}>Alterar Logo</Text>
            </TouchableOpacity>
          </View>
          {renderInput('Nome Fantasia', 'nome_fantasia', 'Nome da sua empresa')}
          {renderInput('Razão Social', 'razao_social', 'Razão social completa')}
          {renderInput('CNPJ', 'cnpj', '00.000.000/0000-00', 'numeric')}
          {renderInput('Inscrição Estadual/Municipal', 'inscricao_estadual', 'Número da inscrição', 'numeric')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço e Contato</Text>
          {renderInput('CEP', 'cep', '00000-000', 'numeric')}
          {renderInput('Endereço', 'endereco', 'Rua, número e complemento')}
          {renderInput('Bairro', 'bairro', 'Bairro')}
          {renderInput('Cidade', 'cidade', 'Cidade')}
          {renderInput('Estado', 'estado', 'Estado')}
          {renderInput('País', 'pais', 'País')}
          {renderInput('Telefone', 'telefone', '(00) 00000-0000', 'numeric')}
          {renderInput('E-mail Principal', 'email_principal', 'contato@suaempresa.com', 'email-address')}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={isDark ? colors.background : '#FFFFFF'} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {toast && (
        <View style={[styles.toastContainer, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </View>
  );
}
