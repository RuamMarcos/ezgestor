import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { styles } from '../../styles/financials/FinancialsPaginationStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onAddTransaction?: () => void;
}

const FinancialsPagination = ({ currentPage, totalPages, onPageChange, onAddTransaction }: PaginationProps) => {
  const { colors } = useTheme();

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
          <View style={[styles.paginationContainer, { alignItems: 'center' }]}>
              <TouchableOpacity
                  style={currentPage === 1 ? [styles.smallNavButton, { backgroundColor: colors.lightGray }, styles.paginationButtonDisabled] : [styles.smallNavButton, { backgroundColor: colors.lightGray }]}
                  onPress={() => onPageChange(1)}
                  disabled={currentPage === 1}
              >
                  <Text style={[styles.smallNavButtonText, { color: colors.darkText }]}>|&lt;</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={currentPage === 1 ? [styles.paginationButton, { backgroundColor: colors.lightGray }, styles.paginationButtonDisabled] : [styles.paginationButton, { backgroundColor: colors.headerBlue }]}
                  onPress={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
              >
                  <Text style={[styles.paginationButtonText, { color: currentPage === 1 ? colors.darkText : colors.background }]}>Anterior</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <Text style={[styles.paginationText, { color: colors.darkText, fontSize: 14, fontWeight: 'bold' }]}>{currentPage} de {totalPages}</Text>
                  <TouchableOpacity onPress={onAddTransaction} style={{ 
                    backgroundColor: colors.headerBlue,
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                    minWidth: 100
                  }}>
                      <MaterialCommunityIcons name="plus" size={14} color={colors.background} style={{ marginRight: 4 }} />
                      <Text style={{ color: colors.background, fontSize: 11, fontWeight: 'bold' }}>Adicionar</Text>
                  </TouchableOpacity>
              </View>

              <TouchableOpacity
                  style={currentPage === totalPages ? [styles.paginationButton, { backgroundColor: colors.lightGray }, styles.paginationButtonDisabled] : [styles.paginationButton, { backgroundColor: colors.headerBlue }]}
                  onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
              >
                  <Text style={[styles.paginationButtonText, { color: currentPage === totalPages ? colors.darkText : colors.background }]}>Próximo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={currentPage === totalPages ? [styles.smallNavButton, { backgroundColor: colors.lightGray }, styles.paginationButtonDisabled] : [styles.smallNavButton, { backgroundColor: colors.lightGray }]}
                  onPress={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
              >
                  <Text style={[styles.smallNavButtonText, { color: colors.darkText }]}>&gt;|</Text>
              </TouchableOpacity>
          </View>
  );
};

export default FinancialsPagination;