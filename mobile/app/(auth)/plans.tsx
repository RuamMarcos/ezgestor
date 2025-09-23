import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Pressable, TouchableOpacity } from 'react-native-gesture-handler';
import Header from '../../components/Header';
import { styles } from '../../styles/auth/plansSytles';

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

