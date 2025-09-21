import { StyleSheet, Dimensions } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');
export const cardWidth = (width - 60) / 2;

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  labelText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: DashboardColors.darkText,
  },
});