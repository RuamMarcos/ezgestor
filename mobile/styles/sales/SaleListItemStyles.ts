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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  paidBadge: {
    backgroundColor: 'rgba(40, 167, 69, 0.08)',
    borderWidth: 1,
    borderColor: DashboardColors.green,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  paidBadgeText: {
    color: DashboardColors.green,
    fontSize: 12,
    fontWeight: '600',
  },
  quantityBadge: {
    backgroundColor: 'rgba(253, 126, 20, 0.1)',
    borderWidth: 1,
    borderColor: DashboardColors.orange,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 8,
  },
  quantityBadgeText: {
    color: DashboardColors.orange,
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardColors.headerBlue,
    marginLeft: 10,
  },
});