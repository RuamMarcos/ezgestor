import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: DashboardColors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
  },
});