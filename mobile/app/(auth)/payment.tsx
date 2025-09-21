import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import Header from '../../components/Header';
import Colors from '../../constants/Colors';
import api from '../../utils/api';
import { Link, useRouter } from 'expo-router';

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
    Alert.alert('Sucesso', 'Cadastro finalizado! Acesso liberado.');
    
    router.push('/(tabs)/dashboard');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
                onChangeText={(text) => setNumeroCartao(aplicarMascaraCartao(text))} // 2. Aplica a máscara
              />
              <View style={styles.inputRow}>
                <TextInput 
                  style={[styles.input, styles.inputHalf]} 
                  placeholder="Validade (MM/AA)" 
                  keyboardType="numeric" 
                  value={validade}
                  onChangeText={(text) => setValidade(aplicarMascaraValidade(text))} // 2. Aplica a máscara
                />
                <TextInput 
                  style={[styles.input, styles.inputHalf]} 
                  placeholder="CVV" 
                  keyboardType="numeric" 
                  secureTextEntry 
                  value={cvv}
                  onChangeText={(text) => setCvv(aplicarMascaraCvv(text))} // 2. Aplica a máscara
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  planInfoCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  planBadge: {
    backgroundColor: '#10b981',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  planTrial: {
    color: '#059669',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  paymentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  paymentButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  paymentButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: '#eef2ff',
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentTitle: {
    fontWeight: 'bold',
    marginTop: 4,
    color: Colors.textPrimary,
  },
  paymentTitleActive: {
    color: Colors.primary,
  },
  paymentDetails: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pixBox: {
    backgroundColor: '#f0f9ff',
    borderColor: '#7dd3fc',
    borderWidth: 1,
  },
  boletoBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    borderWidth: 1,
  },
  infoBoxIcon: {
    fontSize: 32,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: Colors.textPrimary,
  },
  infoBoxText: {
    textAlign: 'center',
    marginTop: 4,
    color: Colors.textSecondary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  termsText: {
    flex: 1,
    marginLeft: 10,
    color: Colors.textSecondary,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePlanButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  changePlanButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});