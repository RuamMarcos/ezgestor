import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Pressable, TouchableOpacity } from 'react-native-gesture-handler';
import Header from '../../components/Header';
import Colors from '../../constants/Colors';

export default function PlanosScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Assine o Plano Ideal para Seu Negócio</Text>
          <Text style={styles.subtitle}>
            Gerencie suas vendas, estoque e finanças de forma simples e eficiente.
          </Text>

          <View style={styles.planCard}>
            <View style={styles.popularBanner}>
              <Text style={styles.popularText}>Mais Popular</Text>
            </View>
            <Text style={styles.planTitle}>Plano Padrão</Text>
            <Text style={styles.planPrice}>R$ 29,99/mês</Text>

            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>✓ Dashboard completo com gráficos</Text>
              <Text style={styles.featureItem}>✓ Vendas ilimitadas</Text>
              <Text style={styles.featureItem}>✓ Gestão completa de estoque</Text>
              <Text style={styles.featureItem}>✓ Controle de fluxo de caixa</Text>
              <Text style={styles.featureItem}>✓ Emissão de NFe</Text>
              <Text style={styles.featureItem}>✓ Múltiplos usuários</Text>
              <Text style={styles.featureItem}>✓ Relatórios avançados</Text>
              <Text style={styles.featureItem}>✓ Formas de pagamento (PIX/Dinheiro)</Text>
            </View>

            <Link href="/(auth)/payment" asChild>
              <Pressable style={styles.subscribeButton}>
                <Text style={styles.subscribeButtonText}>Assinar Plano Padrão</Text>
              </Pressable>
            </Link>
          </View>
          <Text style={styles.footerText}>💡 Cancele a qualquer momento • Sem taxas de cancelamento</Text>
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
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginVertical: 12,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginVertical: 20,
  },
  featureItem: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  subscribeButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  popularBanner: {
    position: 'absolute',
    top: 20,
    right: -45,
    backgroundColor: '#ef4444',
    paddingHorizontal: 50,
    paddingVertical: 5,
    transform: [{ rotate: '45deg' }],
  },
  popularText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});