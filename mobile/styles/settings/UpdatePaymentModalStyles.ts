import { StyleSheet } from 'react-native';
import { AppColors } from '@/constants/Colors';

export const createStyles = (colors: AppColors, isDark: boolean) => {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '90%',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: colors.grayText,
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDark ? colors.darkGray : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputWrapper: {
      flex: 1,
    },
    gap: {
      width: 16,
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 24,
    },
    button: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginLeft: 12,
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.headerBlue,
    },
    saveButtonDisabled: {
      backgroundColor: colors.headerBlue,
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? colors.text : '#FFFFFF',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
  });
};