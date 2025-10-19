import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    // Shadow iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Elevation Android
    elevation: 2,
  },
  imageWrapper: {
    height: 110,
    backgroundColor: '#f1f5f9',
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
    color: DashboardColors.darkText,
  },
  cardSub: {
    fontSize: 12,
    color: DashboardColors.grayText,
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: '700',
    color: DashboardColors.headerBlue,
  },
});