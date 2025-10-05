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
        borderRadius: 20,
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
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: DashboardColors.lightGray,
    },
    paginationButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: DashboardColors.headerBlue,
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: DashboardColors.lightGray,
    },
    paginationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    paginationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: DashboardColors.darkText,
    },
});