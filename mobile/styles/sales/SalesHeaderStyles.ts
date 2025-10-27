import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    marginTop: -40,
    backgroundColor: DashboardColors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
  },
  addButton: {
    backgroundColor: DashboardColors.headerBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});