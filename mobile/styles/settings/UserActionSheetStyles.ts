import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
      padding: 16,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
      textAlign: 'center',
    },
    actionsList: {
      paddingVertical: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    actionIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.darkText,
    },
    deleteText: {
      color: '#EF4444',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    cancelButton: {
      backgroundColor: colors.lightGray,
      margin: 16,
      marginTop: 8,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.grayText,
    },
  });
