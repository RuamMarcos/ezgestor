import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.darkText,
    },
    modalBody: {
      padding: 20,
    },
    userInfoCard: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.lightGray,
      borderRadius: 12,
      marginBottom: 20,
    },
    userAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.headerBlue,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    userAvatarText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? colors.background : '#FFFFFF',
    },
    userInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.grayText,
      marginBottom: 8,
    },
    userTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '500',
    },
    adminTag: {
      backgroundColor: '#FEF3C7',
    },
    adminTagText: {
      color: '#92400E',
    },
    employeeTag: {
      backgroundColor: '#DBEAFE',
    },
    employeeTagText: {
      color: '#1E40AF',
    },
    activeTag: {
      backgroundColor: '#D1FAE5',
    },
    activeTagText: {
      color: '#065F46',
    },
    inactiveTag: {
      backgroundColor: '#FEE2E2',
    },
    inactiveTagText: {
      color: '#991B1B',
    },
    warningSection: {
      gap: 12,
    },
    warningCard: {
      flexDirection: 'row',
      padding: 12,
      backgroundColor: '#FEF3C7',
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#F59E0B',
    },
    warningTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    warningTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#92400E',
      marginBottom: 4,
    },
    warningText: {
      fontSize: 13,
      color: '#92400E',
      lineHeight: 18,
    },
    alternativeCard: {
      flexDirection: 'row',
      padding: 12,
      backgroundColor: '#D1FAE5',
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#10B981',
    },
    alternativeTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    alternativeTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#065F46',
      marginBottom: 4,
    },
    alternativeText: {
      fontSize: 13,
      color: '#065F46',
      lineHeight: 18,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: '#FEE2E2',
      borderRadius: 8,
      gap: 8,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      color: '#991B1B',
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    button: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    cancelButton: {
      backgroundColor: colors.lightGray,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.grayText,
    },
    deleteButton: {
      backgroundColor: '#EF4444',
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
