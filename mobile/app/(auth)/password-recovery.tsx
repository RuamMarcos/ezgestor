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
import { styles } from '../../styles/auth/PasswordRecoveryStyles';
import Header from '../../components/shared/AuthHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { landingPageColors } from '../../constants/IndexColors';
import * as AuthService from '../../services/AuthService';

type Step = 'request' | 'verify' | 'confirm' | 'success';

const PasswordRecoveryScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const getErrorDetail = (error: any): string => {
    if (error?.detail) {
      return String(error.detail);
    }
    if (error?.message) {
      return String(error.message);
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Ocorreu um erro desconhecido.';
  };

  const handleRequestCode = async () => {
    if (!email.includes('@')) {
      setErrorMessage('Por favor, insira um e-mail válido.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      await AuthService.requestPasswordReset(email);
      setStep('verify');
    } catch (error: any) {
      setErrorMessage(getErrorDetail(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) {
      setErrorMessage('O código deve ter 6 dígitos.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      await AuthService.verifyPasswordResetCode(email, code);
      setStep('confirm');
    } catch (error: any) {
      setErrorMessage(getErrorDetail(error) || 'Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!password || !passwordConfirm) {
      setErrorMessage('Preencha ambos os campos de senha.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await AuthService.confirmPasswordReset(email, code, password);
      setStep('success');
    } catch (error: any) {
      setErrorMessage(getErrorDetail(error) || 'Não foi possível redefinir a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'request':
        return (
          <>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              Insira seu e-mail para enviarmos um código de recuperação.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="exemplo@mail.com"
                value={email}
                onChangeText={(value) => handleInputChange(setEmail, value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              onPress={handleRequestCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Enviar Código</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 'verify':
        return (
          <>
            <Text style={styles.title}>Verificar Código</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para {email}.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código de Verificação</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                value={code}
                onChangeText={(value) => handleInputChange(setCode, value)}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Verificar</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 'confirm':
        return (
          <>
            <Text style={styles.title}>Definir Nova Senha</Text>
            <Text style={styles.subtitle}>
              Crie uma nova senha para sua conta.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha:</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                value={password}
                onChangeText={(value) => handleInputChange(setPassword, value)}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Nova Senha:</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                value={passwordConfirm}
                onChangeText={(value) => handleInputChange(setPasswordConfirm, value)}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              onPress={handleConfirmReset}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Redefinir Senha</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 'success':
        return (
          <>
            <Text style={styles.title}>Sucesso!</Text>
            <Text style={styles.successText}>
              Sua senha foi redefinida com sucesso.
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.continueButtonText}>Ir para o Login</Text>
            </TouchableOpacity>
          </>
        );
    }
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
            <View style={styles.formContainer}>
              {renderStep()}

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {step !== 'success' && (
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.backLink}>Voltar para o Login</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default PasswordRecoveryScreen;