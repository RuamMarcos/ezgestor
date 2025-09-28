import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const cardWidth = (width - 60) / 2;

export const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  titleText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});