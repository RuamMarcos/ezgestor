import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 12,
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.darkText,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 16,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: colors.border,
      marginBottom: 12,
      backgroundColor: colors.card,
    },
    logoButton: {
      backgroundColor: colors.headerBlue,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    logoButtonText: {
      color: isDark ? colors.background : '#FFFFFF',
      fontWeight: '600',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.grayText,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.darkText,
    },
    inputError: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: colors.headerBlue,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    saveButtonDisabled: {
      backgroundColor: '#A0A0A0',
    },
    saveButtonText: {
      color: isDark ? colors.background : '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    toastContainer: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toastSuccess: {
      backgroundColor: '#4CAF50',
    },
    toastError: {
      backgroundColor: '#F44336',
    },
    toastText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
