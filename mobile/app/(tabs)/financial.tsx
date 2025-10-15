import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { getLancamentos, getFinancialStats } from '@/services/FinancialService';
import type { LancamentoFinanceiro, FinancialStats } from '@/services/FinancialService';
import SummaryCard from '@/components/dashboard/SummaryCard';
import TransactionListItem from '@/components/financials/TransactionListItem';
import FinancialsPagination from '@/components/financials/FinancialsPagination';
import FinancialsHeader from '@/components/financials/FinancialsHeader';
import FinancialChart from '@/components/financials/FinancialChart';
import { styles } from '@/styles/financial/FinancialStyles';

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
        <View style={styles.screen}>
            <FlatList
                data={lancamentos}
                keyExtractor={(item) => item.id_lancamento.toString()}
                renderItem={({ item }) => <TransactionListItem item={item} />}
                ListHeaderComponent={
                    <View>
                        <View style={styles.headerSpacing}>
                            <Text style={styles.pageTitle}>Fluxo de Caixa</Text>
                        </View>
                        {stats && (
                            <View style={styles.cardsSection}>
                                <View style={styles.cardsRow}>
                                    <SummaryCard title="Entradas" value={formatCurrency(stats.total_entradas)} backgroundColor="#28a745" span="half" />
                                    <SummaryCard title="Saídas" value={formatCurrency(stats.total_saidas)} backgroundColor="#dc3545" span="half" />
                                </View>
                                <View style={styles.cardsRowFull}>
                                    <SummaryCard title="Saldo" value={formatCurrency(stats.saldo_atual)} backgroundColor="#17a2b8" span="full" />
                                </View>
                            </View>
                        )}
                        <View style={styles.chartContainer}>
                            <FinancialChart />
                        </View>
                        <FinancialsHeader 
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            selectedType={selectedType}
                            onTypeChange={setSelectedType}
                            onAddTransaction={() => Alert.alert("WIP", "Modal de novo lançamento")} 
                        />
                        <Text style={styles.listTitle}>Histórico de Transações</Text>
                    </View>
                }
                ListFooterComponent={
                    listLoading ? <ActivityIndicator style={styles.footerLoader}/> : (
                        <FinancialsPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}
