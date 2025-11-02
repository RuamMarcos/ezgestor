import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  listContentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: DashboardColors.orange,
  },
  emptyText: {
    fontSize: 16,
    color: DashboardColors.grayText,
  },
  footerLoading: {
    paddingVertical: 20,
  },
  logItemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: DashboardColors.darkText,
    marginBottom: 8,
  },
  logMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logMetaText: {
    fontSize: 14,
    color: DashboardColors.grayText,
  },
  logTimestamp: {
    fontSize: 12,
    color: DashboardColors.grayText,
    textAlign: 'right',
  },
});