import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DashboardColors.background,
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
        color: DashboardColors.darkText,
    },
    addButton: {
        backgroundColor: DashboardColors.headerBlue,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    searchInput: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: DashboardColors.lightGray,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 10,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: DashboardColors.lightGray,
        width: '100%',
        marginTop: 10,
    },
    paginationButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: DashboardColors.headerBlue,
        borderRadius: 8,
    },
    smallNavButton: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: DashboardColors.lightGray,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallNavButtonText: {
        color: DashboardColors.darkText,
        fontSize: 14,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: DashboardColors.lightGray,
        opacity: 0.7,
    },
    paginationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    paginationText: {
        fontSize: 16,
        fontWeight: '600',
        color: DashboardColors.darkText,
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