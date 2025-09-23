import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import Header from '../../components/Header';
import api from '../../utils/api';
import { Link, useRouter } from 'expo-router';
import { styles } from '../../styles/auth/paymentSytles';
import { LinearGradient } from 'expo-linear-gradient';
import { landingPageColors } from '../../constants/IndexColors';

type PaymentMethod = 'cartao' | 'pix' | 'boleto';

import{
  aplicarMascaraCartao,
  aplicarMascaraValidade,
  aplicarMascaraCvv
} from '../../utils/masks';

export default function PagamentoScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cartao');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [numeroCartao, setNumeroCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');

  const PaymentMethodButton = ({ method, title, icon }: { method: PaymentMethod; title: string; icon: string }) => (
    <TouchableOpacity
      style={[styles.paymentButton, paymentMethod === method && styles.paymentButtonActive]}
      onPress={() => setPaymentMethod(method)}
    >
      <Text style={styles.paymentIcon}>{icon}</Text>
      <Text style={[styles.paymentTitle, paymentMethod === method && styles.paymentTitleActive]}>{title}</Text>
    </TouchableOpacity>
  );

  const handleConfirmarPagamento = async () => {
    if (!termsAccepted) {
      Alert.alert('Atenção', 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    if (paymentMethod === 'cartao') {
      if (!numeroCartao || !validade || !cvv || !nomeCartao) {
        Alert.alert('Atenção', 'Por favor, preencha todos os dados do cartão.');
        return;
      }
    }

    try {
      // O ID do plano padrão é 1, conforme cadastrado no admin.
      const planoId = 1;

      await api.post('/accounts/payment/process/', {
        plano_id: planoId,
        metodo: paymentMethod,
      });

      // Se a requisição for bem-sucedida, avisa o usuário e navega para o dashboard
      Alert.alert('Sucesso', 'Cadastro finalizado! Seu acesso ao sistema foi liberado.');
      router.push('/(tabs)/dashboard');

    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      const errorMessage = error.response?.data?.detail || 'Não foi possível finalizar a assinatura. Tente novamente.';
      Alert.alert("Erro no Pagamento", errorMessage);
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
          <Text style={styles.mainTitle}>Finalizar Cadastro</Text>

          <View style={styles.planInfoCard}>
            <Text style={styles.planBadge}>PLANO SELECIONADO</Text>
            <Text style={styles.planName}>Plano Padrão</Text>
            <Text style={styles.planPrice}>R$ 29,99/mês</Text>
            <Text style={styles.planTrial}>🎁 Grátis por 15 dias</Text>
          </View>

          <Text style={styles.sectionTitle}>Escolha a forma de pagamento</Text>
          <View style={styles.paymentButtonsContainer}>
            <PaymentMethodButton method="cartao" title="Cartão" icon="💳" />
            <PaymentMethodButton method="pix" title="PIX" icon="📱" />
            <PaymentMethodButton method="boleto" title="Boleto" icon="🧾" />
          </View>
          {paymentMethod === 'cartao' && (
            <View style={styles.paymentDetails}>
              <TextInput 
                style={styles.input} 
                placeholder="Número do Cartão" 
                keyboardType="numeric" 
                value={numeroCartao}
                maxLength={19}
                onChangeText={(text) => setNumeroCartao(aplicarMascaraCartao(text))}
              />
              <View style={styles.inputRow}>
                <TextInput 
                  style={[styles.input, styles.inputTwoThirds]} 
                  placeholder="Validade (MM/AA)" 
                  keyboardType="numeric" 
                  value={validade}
                  maxLength={5}
                  onChangeText={(text) => setValidade(aplicarMascaraValidade(text))}
                />
                <TextInput 
                  style={[styles.input, styles.inputOneThird]} 
                  placeholder="CVV" 
                  keyboardType="numeric" 
                  secureTextEntry 
                  value={cvv}
                  maxLength={4}
                  onChangeText={(text) => setCvv(aplicarMascaraCvv(text))}
                />
              </View>
              <TextInput 
                style={styles.input} 
                placeholder="Nome no Cartão" 
                value={nomeCartao}
                onChangeText={setNomeCartao}
              />
            </View>
          )}
          {paymentMethod === 'pix' && (
            <View style={[styles.paymentDetails, styles.infoBox, styles.pixBox]}>
              <Text style={styles.infoBoxIcon}>📱</Text>
              <Text style={styles.infoBoxTitle}>Pagamento via PIX</Text>
              <Text style={styles.infoBoxText}>Após confirmar, você receberá um QR Code para realizar o pagamento.</Text>
            </View>
          )}
          {paymentMethod === 'boleto' && (
            <View style={[styles.paymentDetails, styles.infoBox, styles.boletoBox]}>
              <Text style={styles.infoBoxIcon}>🧾</Text>
              <Text style={styles.infoBoxTitle}>Pagamento via Boleto</Text>
              <Text style={styles.infoBoxText}>O boleto será gerado e poderá ser pago em qualquer banco ou lotérica.</Text>
              <Text style={[styles.infoBoxText, { fontWeight: 'bold' }]}>Vencimento: 3 dias úteis</Text>
            </View>
          )}

          <View style={styles.termsContainer}>
            <Switch value={termsAccepted} onValueChange={setTermsAccepted} />
            <Text style={styles.termsText}>
              Li e aceito os <Text style={styles.linkText}>Termos de Uso</Text> e a <Text style={styles.linkText}>Política de Privacidade</Text>.
            </Text>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmarPagamento}>
            <Text style={styles.confirmButtonText}>Finalizar Cadastro</Text>
          </TouchableOpacity>
          <Link href="/(auth)/plans" asChild>
            <TouchableOpacity style={styles.changePlanButton}>
              <Text style={styles.changePlanButtonText}>Alterar Plano</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      </LinearGradient>
    </ScrollView>
  );
}