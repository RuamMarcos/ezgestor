import { StyleSheet } from 'react-native';
import { AppColors } from '@/constants/Colors';

export const createStyles = (colors: AppColors, isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    loadingText: {
      fontSize: 16,
      color: colors.grayText,
      marginTop: 12,
    },
    scrollContainer: {
      padding: 16,
    },
    // Nenhum plano
    noSubscriptionCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    noSubTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    noSubText: {
      fontSize: 14,
      color: colors.grayText,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 24,
    },
    plansButton: {
      backgroundColor: colors.headerBlue,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    plansButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
    // Cards
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.grayText,
      marginBottom: 8,
    },
    // Card Plano
    planoNome: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    planoPreco: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.headerBlue,
      marginVertical: 4,
    },
    proximaFatura: {
      fontSize: 14,
      color: colors.text,
      marginTop: 8,
    },
    faturaData: {
      fontWeight: 'bold',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    changePlanButton: {
      borderColor: colors.headerBlue,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      alignSelf: 'flex-start',
    },
    changePlanButtonText: {
      color: colors.headerBlue,
      fontWeight: 'bold',
      fontSize: 14,
    },
    // Card Pagamento
    paymentMethodContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    paymentText: {
      fontSize: 16,
      color: colors.text,
    },
    paymentInfo: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    paymentDetails: {
      fontSize: 14,
      color: colors.grayText,
    },
    // Histórico
    historyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    headerText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    cell: {
      fontSize: 14,
      color: colors.text,
    },
    colDate: { flex: 2 },
    colValue: { flex: 2, textAlign: 'left' },
    colStatus: { flex: 2, textAlign: 'left' },
    colRecibo: { flex: 2, textAlign: 'left' },
    pdfButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pdfButtonDisabled: {
      opacity: 0.4,
    },
    pdfText: {
      color: colors.headerBlue,
      marginLeft: 4,
    },
    // Status Chips
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    statusAtiva: {
      backgroundColor: isDark ? '#0A5930' : '#D1FAE5', // green
    },
    textAtiva: {
      color: isDark ? '#A7F3D0' : '#065F46',
    },
    statusPendente: {
      backgroundColor: isDark ? '#704300' : '#FEF3C7', // yellow
    },
    textPendente: {
      color: isDark ? '#FDE68A' : '#92400E',
    },
    statusRecusado: {
      backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2', // red
    },
    textRecusado: {
      color: isDark ? '#FECACA' : '#991B1B',
    },
    statusOutro: {
      backgroundColor: colors.border,
    },
    textOutro: {
      color: colors.grayText,
    },
  });
};