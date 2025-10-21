import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Interfaces (similar to web)
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
  email_contato: string;
  logotipo_url: string;
}

interface ICompanyForm extends Omit<CompanyData, 'logotipo_url' | 'cnpj' | 'email_contato'> {
  logotipo: string | null; // URI da imagem
  email_principal: string;
}

interface FormInputProps extends React.ComponentProps<typeof TextInput> {
    label: string;
    value: string | undefined;
    onChangeText: (text: string) => void;
    placeholder?: string;
    editable?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, value, onChangeText, placeholder, editable = true, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, !editable && styles.inputDisabled]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            editable={editable}
            {...props}
        />
    </View>
);

const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

export default function CompanySettingsScreen() {
    const { user, refreshFromServer } = useAuth();
    const [formData, setFormData] = useState<Partial<ICompanyForm>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            if (empresa.logotipo_url) {
                setLogoPreview(empresa.logotipo_url);
            }
        }
    }, [user]);

    const handleChange = (name: keyof ICompanyForm, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setFormData(prev => ({ ...prev, logotipo: result.assets[0].uri }));
            setLogoPreview(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const dataToSubmit = new FormData();

        // Garante que os valores não sejam undefined
        dataToSubmit.append('empresa.nome_fantasia', formData.nome_fantasia || '');
        dataToSubmit.append('empresa.razao_social', formData.razao_social || '');
        dataToSubmit.append('empresa.inscricao_estadual', formData.inscricao_estadual || '');
        dataToSubmit.append('empresa.endereco', formData.endereco || '');
        dataToSubmit.append('empresa.cep', formData.cep || '');
        dataToSubmit.append('empresa.bairro', formData.bairro || '');
        dataToSubmit.append('empresa.cidade', formData.cidade || '');
        dataToSubmit.append('empresa.estado', formData.estado || '');
        dataToSubmit.append('empresa.pais', formData.pais || '');
        dataToSubmit.append('empresa.telefone', formData.telefone || '');
        dataToSubmit.append('empresa.email_contato', formData.email_principal || '');

        if (formData.logotipo && formData.logotipo.startsWith('file://')) {
            const uriParts = formData.logotipo.split('.');
            const fileType = uriParts[uriParts.length - 1];
            dataToSubmit.append('empresa.logotipo', {
                uri: formData.logotipo,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        try {
            await api.patch('/accounts/profile/', dataToSubmit, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await refreshFromServer();
            Alert.alert('Sucesso', 'Dados da empresa atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            Alert.alert('Erro', 'Falha ao atualizar os dados. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Perfil da Empresa', headerBackTitle: 'Voltar' }} />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                
                <SectionTitle title="Identificação da Empresa" />
                <View style={styles.logoSection}>
                    <Image source={{ uri: logoPreview || 'https://via.placeholder.com/100' }} style={styles.logo} />
                    <TouchableOpacity style={styles.changeLogoButton} onPress={handleImagePick}>
                        <Text style={styles.changeLogoButtonText}>Alterar Logo</Text>
                    </TouchableOpacity>
                </View>

                <FormInput
                    label="Nome Fantasia"
                    value={formData.nome_fantasia}
                    onChangeText={(text) => handleChange('nome_fantasia', text)}
                    placeholder="Ex: Loja do Zé"
                />
                <FormInput
                    label="Razão Social"
                    value={formData.razao_social}
                    onChangeText={(text) => handleChange('razao_social', text)}
                    placeholder="Ex: José da Silva MEI"
                />
                <FormInput
                    label="CNPJ"
                    value={user?.empresa?.cnpj}
                    editable={false}
                    placeholder="00.000.000/0001-00"
                    onChangeText={() => {}} // Adicionado para satisfazer a tipagem
                />
                <FormInput
                    label="Inscrição Estadual/Municipal"
                    value={formData.inscricao_estadual}
                    onChangeText={(text) => handleChange('inscricao_estadual', text)}
                    placeholder="Ex: 123456789"
                />

                <SectionTitle title="Endereço e Contato" />
                <FormInput
                    label="Endereço"
                    value={formData.endereco}
                    onChangeText={(text) => handleChange('endereco', text)}
                    placeholder="Rua das Flores, 123"
                />
                <FormInput
                    label="CEP"
                    value={formData.cep}
                    onChangeText={(text) => handleChange('cep', text)}
                    keyboardType="numeric"
                    placeholder="77000-000"
                />
                <FormInput
                    label="Bairro"
                    value={formData.bairro}
                    onChangeText={(text) => handleChange('bairro', text)}
                    placeholder="Centro"
                />
                <FormInput
                    label="Cidade"
                    value={formData.cidade}
                    onChangeText={(text) => handleChange('cidade', text)}
                    placeholder="Palmas"
                />
                <FormInput
                    label="Estado"
                    value={formData.estado}
                    onChangeText={(text) => handleChange('estado', text)}
                    placeholder="TO"
                />
                 <FormInput
                    label="País"
                    value={formData.pais}
                    onChangeText={(text) => handleChange('pais', text)}
                    placeholder="Brasil"
                />
                <FormInput
                    label="Telefone de Contato"
                    value={formData.telefone}
                    onChangeText={(text) => handleChange('telefone', text)}
                    keyboardType="phone-pad"
                    placeholder="(63) 99999-9999"
                />
                <FormInput
                    label="E-mail Principal"
                    value={formData.email_principal}
                    onChangeText={(text) => handleChange('email_principal', text)}
                    keyboardType="email-address"
                    placeholder="contato@suaempresa.com"
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#343a40',
        marginTop: 20,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        paddingBottom: 8,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#dee2e6',
        backgroundColor: '#e9ecef',
    },
    changeLogoButton: {
        marginTop: 12,
        backgroundColor: '#6c757d',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    changeLogoButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#495057',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ced4da',
        fontSize: 16,
        color: '#495057',
    },
    inputDisabled: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
    },
    saveButton: {
        backgroundColor: '#5e00ea', // Roxo
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});