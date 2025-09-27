import { StyleSheet } from 'react-native';
import { landingPageColors } from '../constants/IndexColors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: landingPageColors.gradientEnd,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  slogan: {
    fontSize: 18,
    color: landingPageColors.sloganText,
    textAlign: 'center',
    maxWidth: '90%',
    marginBottom: 40,
    lineHeight: 25,
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: landingPageColors.primaryButtonBg,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: landingPageColors.primaryButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: landingPageColors.secondaryButtonBorder,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: landingPageColors.secondaryButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});