// filepath: mobile/styles/registerStyles.ts
import { StyleSheet } from "react-native";
import Colors from "../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  loginLinkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});