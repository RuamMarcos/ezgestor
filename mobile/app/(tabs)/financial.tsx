import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { getLancamentos, getFinancialStats } from '@/services/FinancialService';
import type { LancamentoFinanceiro, FinancialStats } from '@/services/FinancialService';
import SummaryCard from '@/components/dashboard/SummaryCard';
import TransactionListItem from '@/components/financials/TransactionListItem';
import FinancialsPagination from '@/components/financials/FinancialsPagination';
import FinancialsHeader from '@/components/financials/FinancialsHeader';
import FinancialChart from '@/components/financials/FinancialChart';

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function FinancialScreen() {
    const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
    const [stats, setStats] = useState<FinancialStats | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [listLoading, setListLoading] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchFinancials = useCallback(async (page: number, search: string, tipo: string) => {
        setListLoading(true);
        try {
            // Apenas busca as stats na primeira página e sem filtros
            if (page === 1 && !search && !tipo) {
                const statsData = await getFinancialStats();
                setStats(statsData);
            }
            const lancamentosData = await getLancamentos({ page, search, tipo });
            setLancamentos(lancamentosData.results);
            setTotalPages(Math.ceil(lancamentosData.count / 10));
        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar os dados financeiros.");
        } finally {
            setListLoading(false);
            setInitialLoading(false);
        }
    }, []);

    // Efeito para busca com debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchFinancials(1, searchTerm, selectedType);
            }
        }, 500); // 500ms de delay
        return () => clearTimeout(timer);
    }, [searchTerm, selectedType]);

    // Efeito para mudar de página
    useEffect(() => {
        fetchFinancials(currentPage, searchTerm, selectedType);
    }, [currentPage]);


    if (initialLoading) {
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={lancamentos}
                keyExtractor={(item) => item.id_lancamento.toString()}
                renderItem={({ item }) => <TransactionListItem item={item} />}
                ListHeaderComponent={
                    <>
                        <View style={styles.pageTitleContainer}>
                            <Text style={styles.pageTitle}>Fluxo de Caixa</Text>
                        </View>
                        {stats && (
                            <View style={styles.summaryContainer}>
                                <SummaryCard title="Entradas" value={formatCurrency(stats.total_entradas)} backgroundColor="#28a745" />
                                <SummaryCard title="Saídas" value={formatCurrency(stats.total_saidas)} backgroundColor="#dc3545" />
                                <SummaryCard title="Saldo" value={formatCurrency(stats.saldo_atual)} backgroundColor="#17a2b8" />
                            </View>
                        )}
                        <FinancialChart />
                        <FinancialsHeader 
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            selectedType={selectedType}
                            onTypeChange={setSelectedType}
                            onAddTransaction={() => Alert.alert("WIP", "Modal de novo lançamento")} 
                        />
                        <Text style={styles.listTitle}>Histórico de Transações</Text>
                    </>
                }
                ListFooterComponent={
                    listLoading ? <ActivityIndicator style={{ marginVertical: 20 }}/> : (
                        <FinancialsPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#f4f7fa'
    },
    pageTitleContainer: {
        paddingHorizontal: 20, 
        paddingTop: 20,
    },
    pageTitle: {
        fontSize: 24, 
        fontWeight: 'bold'
    },
    summaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 15,
    }
});