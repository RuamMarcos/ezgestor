import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';

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
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={DashboardColors.grayText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por descrição..."
          value={searchTerm}
          onChangeText={onSearchChange}
        />
      </View>
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
            style={[styles.typeButton, selectedType === '' && styles.typeButtonActive]} 
            onPress={() => onTypeChange('')}>
            <Text style={[styles.typeButtonText, selectedType === '' && styles.typeButtonTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.typeButton, selectedType === 'entrada' && styles.typeButtonActive]} 
            onPress={() => onTypeChange('entrada')}>
            <Text style={[styles.typeButtonText, selectedType === 'entrada' && styles.typeButtonTextActive]}>Entradas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.typeButton, selectedType === 'saida' && styles.typeButtonActive]} 
            onPress={() => onTypeChange('saida')}>
            <Text style={[styles.typeButtonText, selectedType === 'saida' && styles.typeButtonTextActive]}>Saídas</Text>
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
        backgroundColor: 'white',
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
        backgroundColor: '#e9ecef'
    },
    typeButtonActive: {
        backgroundColor: DashboardColors.headerBlue,
    },
    typeButtonText: {
        fontWeight: 'bold',
        color: DashboardColors.darkText
    },
    typeButtonTextActive: {
        color: 'white'
    }
});

export default FinancialsHeader;