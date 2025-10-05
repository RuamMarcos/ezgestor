import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { aplicarMascaraCnpj } from '../../utils/masks';
import { styles } from '../../styles/auth/RegisterStyles';
import Header from '../../components/shared/AuthHeader';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext'; 
import { LinearGradient } from 'expo-linear-gradient';
import { landingPageColors } from '../../constants/IndexColors';


export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth(); 
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
    const requiredFields: (keyof typeof formData)[] = [
      'nome_fantasia',
      'cnpj',
      'admin_first_name',
      'admin_email',
      'admin_password',
      'confirmPassword',
    ];

    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        Alert.alert('Campo Obrigatório', `Por favor, preencha o campo ${field.replace('_', ' ')}.`);
        return;
      }
    }

    if (formData.admin_password !== formData.confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }
    setLoading(true);

    try {
      const [firstName, ...lastNameParts] = formData.admin_first_name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const apiData = {
        nome_fantasia: formData.nome_fantasia,
        razao_social: `${formData.nome_fantasia} LTDA`,
        cnpj: formData.cnpj,
        admin_email: formData.admin_email,
        admin_first_name: firstName,
        admin_last_name: lastName,
        admin_password: formData.admin_password,
      };

      // 3. Chamar a função register do contexto
      await register(apiData);

      Alert.alert("Sucesso!", "Sua conta foi criada. Agora escolha seu plano.");
      router.push('/(auth)/plans');
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro inesperado.";
      const errorTitle = "Erro no Cadastro";

      if (error.response && error.response.data) {
        // O servidor respondeu com um status de erro e dados
        console.error("Erro do servidor:", error.response.data);
        const errorData = error.response.data;
        
        // Concatena todas as mensagens de erro dos campos em uma única string
        const fieldErrors = Object.values(errorData).flat().join(' ');
        if (fieldErrors) {
          errorMessage = fieldErrors;
        } else {
          errorMessage = "Não foi possível criar a conta. Verifique os dados e tente novamente.";
        }
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error("Erro de rede:", error.request);
        errorMessage = "Não foi possível se conectar ao servidor. Verifique sua conexão com a internet.";
      } else {
        // Algo aconteceu ao configurar a requisição
        console.error("Erro:", error.message);
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={[landingPageColors.gradientStart, landingPageColors.gradientEnd]}
        style={{ flex: 1 }}
      >
      <Header />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Crie sua Conta</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome da Empresa"
              placeholderTextColor={Colors.textSecondary}
              value={formData.nome_fantasia}
              onChangeText={(v) => handleChange('nome_fantasia', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="CNPJ"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              value={formData.cnpj}
              onChangeText={(v) => handleChange('cnpj', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu Nome Completo"
              placeholderTextColor={Colors.textSecondary}
              value={formData.admin_first_name}
              onChangeText={(v) => handleChange('admin_first_name', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu E-mail de Acesso"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.admin_email}
              onChangeText={(v) => handleChange('admin_email', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              value={formData.admin_password}
              onChangeText={(v) => handleChange('admin_password', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              placeholderTextColor={Colors.textSecondary}
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
      </LinearGradient>
    </ScrollView>
  );
}