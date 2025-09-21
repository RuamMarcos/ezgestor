// filepath: mobile/app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { aplicarMascaraCnpj } from '../../utils/masks';
import { styles } from '../../styles/registerStyles';
import Header from '../../components/Header';
import api from '../../utils/api';
import Colors from '../../constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome_fantasia: "",
    cnpj: "",
    admin_first_name: "",
    admin_email: "",
    admin_password: "",
    confirmPassword: "",
  });

  const handleChange = (name: keyof typeof formData, value: string) => {
    const formattedValue = name === "cnpj" ? aplicarMascaraCnpj(value) : value;
    setFormData(prevState => ({ ...prevState, [name]: formattedValue }));
  };

  const handleSubmit = async () => {
    if (formData.admin_password !== formData.confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }
    setLoading(true);

    try {
      const [firstName, ...lastNameParts] = formData.admin_first_name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const response = await api.post('/accounts/register/', {
        nome_fantasia: formData.nome_fantasia,
        razao_social: `${formData.nome_fantasia} LTDA`,
        cnpj: formData.cnpj,
        admin_email: formData.admin_email,
        admin_first_name: firstName,
        admin_last_name: lastName,
        admin_password: formData.admin_password,
      });

      if (response.status === 201) {
        Alert.alert("Sucesso!", "Sua conta foi criada. Agora escolha seu plano.");
        router.push('/(auth)/plans');
      } else {
        Alert.alert("Erro", `Ocorreu um problema (Status: ${response.status}).`);
      }
    } catch (error: any) {
      // Axios lança um erro para respostas com status 4xx ou 5xx.
      if (error.response) {
        // O servidor respondeu com um status de erro
        console.error("Erro do servidor:", error.response.data);
        Alert.alert("Erro no Cadastro", "Não foi possível criar a conta. Verifique os dados e tente novamente.");
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error("Erro de rede:", error.request);
        Alert.alert("Erro de Conexão", "Não foi possível se conectar ao servidor.");
      } else {
        // Algo aconteceu ao configurar a requisição
        console.error("Erro:", error.message);
        Alert.alert("Erro", "Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Crie sua Conta</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome da Empresa"
              value={formData.nome_fantasia}
              onChangeText={(v) => handleChange('nome_fantasia', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="CNPJ"
              keyboardType="numeric"
              value={formData.cnpj}
              onChangeText={(v) => handleChange('cnpj', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu Nome Completo"
              value={formData.admin_first_name}
              onChangeText={(v) => handleChange('admin_first_name', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu E-mail de Acesso"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.admin_email}
              onChangeText={(v) => handleChange('admin_email', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              value={formData.admin_password}
              onChangeText={(v) => handleChange('admin_password', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
            />
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Criar Conta e Avançar</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>
              Já tem uma conta?{' '}
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLinkText}>Faça login</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}