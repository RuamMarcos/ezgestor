import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createFinancialsPaginationStyles } from '../../styles/financials/FinancialsPaginationStyles';
import { useTheme } from '@/context/ThemeContext';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const FinancialsPagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createFinancialsPaginationStyles(colors), [colors]);

    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push('...');
            }
            if (currentPage > 2) {
                pages.push(currentPage - 1);
            }
            if (currentPage !== 1 && currentPage !== totalPages) {
                pages.push(currentPage);
            }
            if (currentPage < totalPages - 1) {
                pages.push(currentPage + 1);
            }
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            pages.push(totalPages);
        }
        return [...new Set(pages)];
    };

    const pageNumbers = getPageNumbers();

    return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={currentPage === 1 ? [styles.smallNavButton, styles.paginationButtonDisabled] : styles.smallNavButton}
                    onPress={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <Text style={styles.smallNavButtonText}>|&lt;</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={currentPage === 1 ? [styles.paginationButton, styles.paginationButtonDisabled] : styles.paginationButton}
                    onPress={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <Text style={styles.paginationButtonText}>Anterior</Text>
                </TouchableOpacity>

                <Text style={styles.paginationText}>{currentPage} de {totalPages}</Text>

                <TouchableOpacity
                    style={currentPage === totalPages ? [styles.paginationButton, styles.paginationButtonDisabled] : styles.paginationButton}
                    onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <Text style={styles.paginationButtonText}>Próximo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={currentPage === totalPages ? [styles.smallNavButton, styles.paginationButtonDisabled] : styles.smallNavButton}
                    onPress={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <Text style={styles.smallNavButtonText}>&gt;|</Text>
                </TouchableOpacity>
            </View>
    );
};

export default FinancialsPagination;