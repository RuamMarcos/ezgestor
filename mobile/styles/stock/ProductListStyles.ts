import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
  },
  itemSku: {
    fontSize: 12,
    color: DashboardColors.grayText,
    marginTop: 2,
  },
  itemDetails: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
  },
  itemQuantity: {
    fontSize: 16,
    color: DashboardColors.darkText,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 12,
    color: DashboardColors.grayText,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    width: 55,
    alignItems: 'center',
  },
  statusLow: {
    backgroundColor: '#fee2e2', // Red-100
  },
  statusOk: {
    backgroundColor: '#dcfce7', // Green-100
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: DashboardColors.grayText,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    paddingLeft: 10,
  },
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
});