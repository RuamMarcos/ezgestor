import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createStockStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.darkText,
    },
    addButton: {
        backgroundColor: colors.headerBlue,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: isDark ? colors.card : '#FFFFFF',
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    searchInput: {
        height: 48,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 10,
        color: colors.darkText,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        width: '100%',
        marginTop: 10,
    },
    paginationButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: colors.headerBlue,
        borderRadius: 8,
    },
    smallNavButton: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallNavButtonText: {
        color: colors.darkText,
        fontSize: 14,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: colors.lightGray,
        opacity: 0.7,
    },
    paginationButtonText: {
        color: isDark ? colors.card : '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    paginationText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkText,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});