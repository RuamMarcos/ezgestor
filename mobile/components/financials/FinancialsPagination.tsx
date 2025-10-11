import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/financials/FinancialsPaginationStyles';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const FinancialsPagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) {
        return null; // Não renderiza se houver apenas uma página
    }

    // Lógica para criar os números das páginas a serem exibidos
    const getPageNumbers = () => {
        const pages = [];
        // Mostra a primeira página, as páginas ao redor da atual e a última página
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
        // Remove duplicatas e reticências desnecessárias
        return [...new Set(pages)];
    };

    const pageNumbers = getPageNumbers();

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
            >
                <Text style={[styles.buttonText, currentPage === 1 && styles.disabledText]}>Anterior</Text>
            </TouchableOpacity>

            {pageNumbers.map((page, index) => 
                page === '...' ? (
                    <Text key={`ellipsis-${index}`} style={{ paddingHorizontal: 5 }}>...</Text>
                ) : (
                    <TouchableOpacity 
                        key={page}
                        style={[styles.pageButton, currentPage === page && styles.activePage]}
                        onPress={() => onPageChange(page as number)}
                    >
                        <Text style={[styles.pageButtonText, currentPage === page && styles.activePageText]}>
                            {page}
                        </Text>
                    </TouchableOpacity>
                )
            )}

            <TouchableOpacity 
                style={styles.button}
                onPress={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
            >
                <Text style={[styles.buttonText, currentPage === totalPages && styles.disabledText]}>Próximo</Text>
            </TouchableOpacity>
        </View>
    );
};

export default FinancialsPagination;