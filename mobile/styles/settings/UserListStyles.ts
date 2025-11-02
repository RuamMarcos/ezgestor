import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    listContent: {
      padding: 16,
      flexGrow: 1,
    },
    memberCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    memberAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.headerBlue,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    memberAvatarText: {
      color: isDark ? colors.background : '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 2,
    },
    memberEmail: {
      fontSize: 13,
      color: colors.grayText,
      marginBottom: 8,
    },
    memberTags: {
      flexDirection: 'row',
      gap: 8,
    },
    roleTag: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    adminTag: {
      backgroundColor: '#FEE2E2',
    },
    employeeTag: {
      backgroundColor: '#DBEAFE',
    },
    roleTagText: {
      fontSize: 11,
      fontWeight: '500',
    },
    adminTagText: {
      color: '#991B1B',
    },
    employeeTagText: {
      color: '#1E40AF',
    },
    statusTag: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    activeTag: {
      backgroundColor: '#D1FAE5',
    },
    inactiveTag: {
      backgroundColor: '#FEE2E2',
    },
    statusTagText: {
      fontSize: 11,
      fontWeight: '500',
    },
    activeTagText: {
      color: '#065F46',
    },
    inactiveTagText: {
      color: '#991B1B',
    },
    menuButton: {
      padding: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.darkText,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.grayText,
      textAlign: 'center',
    },
  });
