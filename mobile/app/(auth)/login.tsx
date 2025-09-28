import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/auth/LoginStyles';
import Header from '../../components/shared/AuthHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { landingPageColors } from '../../constants/IndexColors';

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 


 const handleInputChange = (field: keyof typeof formData, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errorMessage) {
    setErrorMessage('');
  }
};
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Chama a função de login do contexto e aguarda o retorno
      const { hasActiveSubscription } = await login(formData.email, formData.password);

      // Navega com base no status da assinatura
      if (hasActiveSubscription) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/plans');
      }
    } catch (error: any) {
      console.error('Erro na requisição de login:', error);
      setErrorMessage('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A4E9D" barStyle="light-content" />
      <LinearGradient
        colors={[landingPageColors.gradientStart, landingPageColors.gradientEnd]}
        style={{ flex: 1 }}
      >
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header removido em favor do componente Header com logo */}

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="exemplo@mail.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="********"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continuar</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Registre aqui</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  </LinearGradient>
    </SafeAreaView>
  );
};



export default LoginScreen;