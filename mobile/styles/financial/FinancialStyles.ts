import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
    marginBottom: 12,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  chartContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 24,
  },
});
