import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  // Usar mesmo padrão do sales pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: DashboardColors.lightGray,
  },
  paginationButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: DashboardColors.headerBlue,
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: DashboardColors.lightGray,
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
    backgroundColor: DashboardColors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallNavButtonText: {
    color: DashboardColors.darkText,
    fontSize: 14,
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '600',
    color: DashboardColors.darkText,
  },
});