import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  backgroundColor: 'transparent',
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
    width: '100%',
  },
  inputHalf: {
    flex: 1,
    minWidth: 0,
  },
  inputTwoThirds: {
    flex: 2,
    minWidth: 0,
  },
  inputOneThird: {
    flex: 1,
    minWidth: 0,
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