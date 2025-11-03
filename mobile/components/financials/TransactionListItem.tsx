import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LancamentoFinanceiro } from '@/services/FinancialService';
import { useTheme } from '@/context/ThemeContext';
import { TouchableOpacity } from 'react-native';

interface Props {
    item: LancamentoFinanceiro;
    onPress: () => void;
}

interface ItemProps {
    item: LancamentoFinanceiro;
    onPress: () => void;
}

const formatCurrency = (value: string): string => {
    const numberValue = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
};

const TransactionListItem = ({ item, onPress }: Props) => {
    const { colors } = useTheme();
    const isEntrada = item.tipo === 'entrada';
    const color = isEntrada ? '#28A745' : '#FD7E14';
    const valorFormatado = formatCurrency(parseFloat(item.valor));
    const dataFormatada = new Date(item.data_lancamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.info}>
                <Text style={[styles.description, { color: colors.darkText }]}>{item.descricao}</Text>
                <Text style={[styles.date, { color: colors.grayText }]}>{formatDate(item.data_lancamento)}</Text>
            </View>
            <Text style={[styles.amount, { color }]}>
                {isEntrada ? '' : '- '}
                {formatCurrency(item.valor)}
            </Text>
        </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
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
        marginTop: 4,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});


export default TransactionListItem;