import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

const FinancialChart = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visão Geral do Mês</Text>
      <View style={styles.chartPlaceholder}>
        <Text style={styles.placeholderText}>Gráfico de Entradas vs. Saídas</Text>
        <Text style={styles.placeholderSubText}>(Componente em desenvolvimento)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardColors.darkText,
    marginBottom: 10,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  placeholderText: {
    color: DashboardColors.grayText,
    fontWeight: '500',
  },
  placeholderSubText: {
      fontSize: 12,
      color: '#ccc',
      marginTop: 4,
  }
});

export default FinancialChart;