import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import {
  getCurrentSubscription,
  getPaymentHistory,
} from '@/services/SubscriptionService';
import type { IAssinatura, IPagamento } from '@/types/subscription';
import { createStyles } from '@/styles/settings/SubscriptionStyles';
import UpdatePaymentModal from '@/components/settings/UpdatePaymentModal';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [assinatura, setAssinatura] = useState<IAssinatura | null>(null);
  const [pagamentos, setPagamentos] = useState<IPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subData, payData] = await Promise.all([
        getCurrentSubscription(),
        getPaymentHistory(),
      ]);
      setAssinatura(subData);
      setPagamentos(payData);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Erro ao buscar dados da assinatura:', err);
        setError('Erro ao buscar dados da assinatura.');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSuccess = () => {
    fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
    });
  };

  const formatCurrency = (value: string | number) => {
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
  };

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    let style = styles.statusOutro;
    let textStyle = styles.textOutro;
    let icon: 'check-circle' | 'clock-outline' | 'alert-circle' = 'alert-circle';

    if (
      statusLower === 'ativa' ||
      statusLower === 'aprovado' ||
      statusLower === 'confirmado' ||
      statusLower === 'pago'
    ) {
      style = styles.statusAtiva;
      textStyle = styles.textAtiva;
      icon = 'check-circle';
    } else if (statusLower === 'pendente') {
      style = styles.statusPendente;
      textStyle = styles.textPendente;
      icon = 'clock-outline';
    } else if (
      statusLower === 'recusado' ||
      statusLower === 'inativa' ||
      statusLower === 'cancelada' ||
      statusLower === 'inadimplente'
    ) {
      style = styles.statusRecusado;
      textStyle = styles.textRecusado;
      icon = 'alert-circle';
    }

    return (
      <View style={[styles.statusChip, style]}>
        <MaterialCommunityIcons name={icon} size={14} color={textStyle.color} />
        <Text style={[styles.statusText, textStyle]}>{status}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.headerBlue} />
        <Text style={styles.loadingText}>Carregando dados da assinatura...</Text>
      </View>
    );
  }

  if (!assinatura) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.headerBlue}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minha Assinatura</Text>
        </View>
        <View style={styles.centered}>
          <View style={styles.noSubscriptionCard}>
            <Text style={styles.noSubTitle}>Nenhuma Assinatura Ativa</Text>
            <Text style={styles.noSubText}>
              Você ainda não possui um plano ativo para sua empresa.
            </Text>
            <TouchableOpacity
              style={styles.plansButton}
              onPress={() => router.push('/(auth)/plans')}
            >
              <Text style={styles.plansButtonText}>Ver Planos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const hasCard =
    assinatura.metodo_pagamento_padrao === 'cartao' &&
    assinatura.cartao_final;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.headerBlue}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Assinatura</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Card do Plano Atual */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seu Plano Atual</Text>
          <Text style={styles.planoNome}>{assinatura.plano.nome}</Text>
          <Text style={styles.planoPreco}>
            {formatCurrency(assinatura.plano.preco_mensal)} / mês
          </Text>
          <Text style={styles.proximaFatura}>
            Sua próxima fatura será em:{' '}
            <Text style={styles.faturaData}>
              {formatDate(assinatura.data_proximo_pagamento)}
            </Text>
          </Text>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.changePlanButton}
            onPress={() => router.push('/(auth)/plans')}
          >
            <Text style={styles.changePlanButtonText}>Alterar Plano</Text>
          </TouchableOpacity>
        </View>

        {/* Card da Forma de Pagamento */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Forma de Pagamento</Text>
          {hasCard ? (
            <View style={styles.paymentMethodContainer}>
              <MaterialCommunityIcons
                name="credit-card"
                size={24}
                color={colors.grayText}
              />
              <View>
                <Text style={styles.paymentInfo}>
                  {`${
                    assinatura.cartao_bandeira
                      ?.charAt(0)
                      .toUpperCase() + assinatura.cartao_bandeira!.slice(1)
                  } final ${assinatura.cartao_final}`}
                </Text>
                <Text style={styles.paymentDetails}>
                  Expira em: {assinatura.cartao_validade}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.paymentText}>
              Nenhum cartão de crédito cadastrado.
            </Text>
          )}
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.changePlanButton}
            onPress={() => setIsUpdateModalOpen(true)}
          >
            <Text style={styles.changePlanButtonText}>Atualizar Dados</Text>
          </TouchableOpacity>
        </View>

        {/* Histórico de Pagamentos */}
        <View style={styles.card}>
          <Text style={styles.historyTitle}>Suas Faturas Anteriores</Text>
          {/* Cabeçalho da Tabela */}
          <View style={styles.paymentHeader}>
            <Text style={[styles.headerText, styles.colDate]}>Data</Text>
            <Text style={[styles.headerText, styles.colValue]}>Valor</Text>
            <Text style={[styles.headerText, styles.colStatus]}>Status</Text>
          </View>
          {/* Linhas da Tabela */}
          {pagamentos.length > 0 ? (
            pagamentos.map((pagamento) => (
              <View
                key={pagamento.id_pagamento}
                style={styles.paymentRow}
              >
                <Text style={[styles.cell, styles.colDate]}>
                  {formatDate(pagamento.data_pagamento)}
                </Text>
                <Text style={[styles.cell, styles.colValue]}>
                  {formatCurrency(pagamento.valor)}
                </Text>
                <View style={styles.colStatus}>
                  {getStatusChip(pagamento.status)}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.centered}>
              <Text style={styles.loadingText}>Nenhum pagamento encontrado.</Text>
            </View>
          )}
          
           {/* Exemplo de item de fatura com botão de download desabilitado */}
           {pagamentos.length > 0 && (
              <View style={[styles.paymentRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.cell, styles.colDate]}></Text>
                <Text style={[styles.cell, styles.colValue]}></Text>
                <View style={styles.colStatus}>
                  <TouchableOpacity style={[styles.pdfButton, styles.pdfButtonDisabled]} disabled>
                    <MaterialCommunityIcons name="file-download-outline" size={16} color={colors.grayText} />
                    <Text style={[styles.pdfText, { color: colors.grayText }]}>Baixar PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
           )}
        </View>
      </ScrollView>

      {/* Renderiza o modal */}
      <UpdatePaymentModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </View>
  );
}