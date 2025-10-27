import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  // Usar mesmo padrão do sales pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 0,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 10,
    paddingBottom: 10,
  },
  paginationButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#4A55E1',
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#E9ECEF',
    opacity: 0.5,
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  smallNavButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallNavButtonText: {
    color: '#343A40',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
  },
});