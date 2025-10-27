import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  StyleSheet,
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
          const logoUrl = `http://127.0.0.1:8000${empresa.logotipo}`;
          setLogoPreview(logoUrl);
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

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const filename = file.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

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

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'logotipo' && value) {
        const unmaskedValue = ['cnpj', 'cep', 'telefone'].includes(key)
          ? (value as string).replace(/\D/g, '')
          : value;
        dataToSubmit.append(key, unmaskedValue as string);
      }
    });
    
    if (formData.logotipo) {
        dataToSubmit.append('logotipo', {
          uri: formData.logotipo.uri,
          name: formData.logotipo.name,
          type: formData.logotipo.type,
        } as any);
      }

    try {
      await api.patch('/accounts/profile/empresa/', dataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshFromServer();
      setToast({ message: 'Dados da empresa atualizados!', type: 'success' });
      setErrors({});
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setToast({ message: 'Falha ao atualizar os dados.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 12,
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.darkText,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 16,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: colors.border,
      marginBottom: 12,
    },
    logoButton: {
      backgroundColor: colors.headerBlue,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    logoButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    inputError: {
      borderColor: '#FF0000',
    },
    errorText: {
      color: '#FF0000',
      fontSize: 12,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: colors.headerBlue,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    saveButtonDisabled: {
      backgroundColor: isDark ? '#6B7280' : '#A0A0A0',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    toastContainer: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toastSuccess: {
      backgroundColor: isDark ? '#15803D' : '#4CAF50',
    },
    toastError: {
      backgroundColor: isDark ? '#DC2626' : '#F44336',
    },
    toastText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const renderInput = (
    formData: ICompanyForm,
    handleChange: (name: keyof ICompanyForm, value: string) => void,
    errors: Record<string, string>,
    label: string,
    name: keyof ICompanyForm,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'email-address' = 'default',
    colors: any
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.grayText }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.darkText }, errors[name] ? styles.inputError : null]}
        value={formData[name] as string}
        onChangeText={text => handleChange(name, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={colors.grayText}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name]}</Text>}
    </View>
  );

  if (isPageLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
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
          {renderInput(formData, handleChange, errors, 'Nome Fantasia', 'nome_fantasia', 'Nome da sua empresa', 'default', colors)}
          {renderInput(formData, handleChange, errors, 'Razão Social', 'razao_social', 'Razão social completa', 'default', colors)}
          {renderInput(formData, handleChange, errors, 'CNPJ', 'cnpj', '00.000.000/0000-00', 'numeric', colors)}
          {renderInput(formData, handleChange, errors, 'Inscrição Estadual/Municipal', 'inscricao_estadual', 'Número da inscrição', 'numeric', colors)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço e Contato</Text>
          {renderInput(formData, handleChange, errors, 'CEP', 'cep', '00000-000', 'numeric', colors)}
          {renderInput(formData, handleChange, errors, 'Endereço', 'endereco', 'Rua, número e complemento', 'default', colors)}
          {renderInput(formData, handleChange, errors, 'Bairro', 'bairro', 'Bairro', 'default', colors)}
          {renderInput(formData, handleChange, errors, 'Cidade', 'cidade', 'Cidade', 'default', colors)}
          {renderInput(formData, handleChange, errors, 'Estado', 'estado', 'Estado', 'default', colors)}
          {renderInput(formData, handleChange, errors, 'País', 'pais', 'País', 'default', colors)}
          {renderInput(formData, handleChange, errors, 'Telefone', 'telefone', '(00) 00000-0000', 'numeric', colors)}
          {renderInput(formData, handleChange, errors, 'E-mail Principal', 'email_principal', 'contato@suaempresa.com', 'email-address', colors)}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
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
