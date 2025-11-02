import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: 16,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
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
    addButton: {
      backgroundColor: colors.headerBlue,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    addButtonText: {
      color: isDark ? colors.background : '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    filtersContainer: {
      backgroundColor: colors.card,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.lightGray,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.darkText,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.headerBlue,
      borderColor: colors.headerBlue,
    },
    filterChipText: {
      fontSize: 12,
      color: colors.grayText,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: isDark ? colors.background : '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    paginationButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.headerBlue,
      borderRadius: 8,
    },
    paginationButtonText: {
      color: isDark ? colors.background : '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: colors.lightGray,
      opacity: 0.7,
    },
    paginationText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
    },
    smallNavButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: colors.headerBlue,
      borderRadius: 8,
    },
    smallNavButtonText: {
      color: isDark ? colors.background : '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
