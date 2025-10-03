import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: DashboardColors.lightGray,
    backgroundColor: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
  },
  saleDetail: {
    fontSize: 14,
    color: DashboardColors.grayText,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardColors.headerBlue,
    marginLeft: 10,
  },
});