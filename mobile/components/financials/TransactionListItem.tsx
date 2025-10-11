import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LancamentoFinanceiro } from '@/services/FinancialService';
import { DashboardColors } from '@/constants/DashboardColors';

interface Props {
    item: LancamentoFinanceiro;
}

const formatCurrency = (value: string): string => {
    const numberValue = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
};

const TransactionListItem = ({ item }: Props) => {
    const isEntrada = item.tipo === 'entrada';
    const color = isEntrada ? DashboardColors.green : DashboardColors.orange;

    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <Text style={styles.description}>{item.descricao}</Text>
                <Text style={styles.date}>{formatDate(item.data_lancamento)}</Text>
            </View>
            <Text style={[styles.amount, { color }]}>
                {isEntrada ? '' : '- '}
                {formatCurrency(item.valor)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 10,
        marginHorizontal: 20,
    },
    info: {
        flex: 1,
    },
    description: {
        fontSize: 16,
        fontWeight: '500',
    },
    date: {
        fontSize: 12,
        color: DashboardColors.grayText,
        marginTop: 4,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});


export default TransactionListItem;