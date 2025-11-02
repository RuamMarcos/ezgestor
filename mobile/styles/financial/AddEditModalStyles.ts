import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createAddEditModalStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.darkText,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: colors.darkText,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: colors.darkText,
    backgroundColor: isDark ? colors.lightGray : colors.card,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 10,
  },
  tipoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tipoButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: colors.card,
  },
  tipoButtonSaida: {
    backgroundColor: isDark ? '#451a1a' : '#fde8e8',
    borderColor: '#dc3545',
  },
  tipoButtonEntrada: {
    backgroundColor: isDark ? '#1e3a2a' : '#eaf7ec',
    borderColor: '#28a745',
  },
  tipoButtonText: {
    fontSize: 16,
    color: colors.darkText,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  deleteButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
  }
});