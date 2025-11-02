import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createProductListStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  list: {
    paddingHorizontal: 20,
  },
  grid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    paddingBottom: 24, // Add padding at the bottom to give space for pagination
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
  },
  imageWrapper: {
    height: 120,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
  },
  cardSub: {
    fontSize: 12,
    color: colors.grayText,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 6,
  },
  cardStatus: {
    fontSize: 12,
    color: colors.grayText,
  },
  cardActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContainer: {
    backgroundColor: colors.card,
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
    color: colors.darkText,
  },
  itemSku: {
    fontSize: 12,
    color: colors.grayText,
    marginTop: 2,
  },
  itemDetails: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
  },
  itemQuantity: {
    fontSize: 16,
    color: colors.darkText,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 12,
    color: colors.grayText,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    width: 55,
    alignItems: 'center',
  },
  statusLow: {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#fee2e2',
  },
  statusOk: {
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.35)' : '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.grayText,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 10,
  },
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
});