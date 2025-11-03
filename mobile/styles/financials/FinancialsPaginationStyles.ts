import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createFinancialsPaginationStyles = (colors: ThemeColors) => StyleSheet.create({
  // Usar mesmo padrão do sales pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paginationButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.headerBlue,
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.7,
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  smallNavButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallNavButtonText: {
    color: colors.darkText,
    fontSize: 14,
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
  },
});