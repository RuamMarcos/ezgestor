import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface FinancialsHeaderProps {
  searchTerm: string;
  onSearchChange: (text: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  onAddTransaction: () => void;
}

const FinancialsHeader = ({
    searchTerm,
    onSearchChange,
    selectedType,
    onTypeChange,
    onAddTransaction
}: FinancialsHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.grayText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.darkText }]}
          placeholder="Pesquisar por descrição..."
          placeholderTextColor={colors.grayText}
          value={searchTerm}
          onChangeText={onSearchChange}
        />
      </View>
      <View style={styles.filtersContainer}>
        <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: colors.lightGray }, selectedType === '' && { backgroundColor: colors.headerBlue }]}
            onPress={() => onTypeChange('')}>
            <Text style={[styles.typeButtonText, { color: colors.darkText }, selectedType === '' && styles.typeButtonTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: colors.lightGray }, selectedType === 'entrada' && { backgroundColor: colors.headerBlue }]}
            onPress={() => onTypeChange('entrada')}>
            <Text style={[styles.typeButtonText, { color: colors.darkText }, selectedType === 'entrada' && styles.typeButtonTextActive]}>Entradas</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: colors.lightGray }, selectedType === 'saida' && { backgroundColor: colors.headerBlue }]}
            onPress={() => onTypeChange('saida')}>
            <Text style={[styles.typeButtonText, { color: colors.darkText }, selectedType === 'saida' && styles.typeButtonTextActive]}>Saídas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 5,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    typeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    typeButtonText: {
        fontWeight: 'bold',
    },
    typeButtonTextActive: {
        color: 'white'
    }
});

export default FinancialsHeader;