import React, { useState } from 'react';
import { aplicarMascaraCnpj, aplicarMascaraTelefone } from "../../utils/masks";
import { styles } from "../../styles/registerStyles";
import Header from '../../components/Header';

import { 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  View,
} from 'react-native';

interface FormData {
  nomeEmpresa: string;
  cnpj: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: '',
    cnpj: '',
    nomeCompleto: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleChange = (field: keyof FormData, value: string) => {
    let valorFormatado = value;
    
    if (field === 'cnpj') {
      valorFormatado = aplicarMascaraCnpj(value);
    } else if (field === 'telefone') {
      valorFormatado = aplicarMascaraTelefone(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: valorFormatado }));
  };

  const handleSubmit = () => {
    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }
    if (formData.senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    console.log('Dados enviados:', formData);
    Alert.alert('Sucesso', 'Conta criada com sucesso!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Header />

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Crie sua Conta e Cadastre sua Empresa</Text>
          
          {/* Formulário */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome Fantasia da Empresa"
              placeholderTextColor="#666"
              value={formData.nomeEmpresa}
              onChangeText={(value) => handleChange('nomeEmpresa', value)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="CNPJ (00.000.000/0001-00)"
              placeholderTextColor="#666"
              value={formData.cnpj}
              onChangeText={(value) => handleChange('cnpj', value)}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Seu Nome Completo (Administrador)"
              placeholderTextColor="#666"
              value={formData.nomeCompleto}
              onChangeText={(value) => handleChange('nomeCompleto', value)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Seu E-mail de Acesso"
              placeholderTextColor="#666"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Telefone / WhatsApp ((00) 00000-0000)"
              placeholderTextColor="#666"
              value={formData.telefone}
              onChangeText={(value) => handleChange('telefone', value)}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Senha (Mínimo 6 caracteres)"
              placeholderTextColor="#666"
              value={formData.senha}
              onChangeText={(value) => handleChange('senha', value)}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              placeholderTextColor="#666"
              value={formData.confirmarSenha}
              onChangeText={(value) => handleChange('confirmarSenha', value)}
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Criar Conta e Avançar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>
              Já tem uma conta?{' '}
              <Text style={styles.loginLinkText}>Faça login</Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

import { Text } from 'react-native';