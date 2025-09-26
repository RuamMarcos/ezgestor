import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    // Sombra para iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginVertical: 12,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginVertical: 20,
  },
  featureItem: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    // Sombra para iOS
    shadowColor: Colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, // Adicionado para iOS
  },
  subscribeButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  popularBanner: {
    position: 'absolute',
    top: 20,
    right: -45,
    backgroundColor: '#ef4444',
    paddingHorizontal: 50,
    paddingVertical: 5,
    transform: [{ rotate: '45deg' }],
  },
  popularText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});