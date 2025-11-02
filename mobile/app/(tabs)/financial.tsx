import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getLancamentos, getFinancialStats, createLancamento, updateLancamento, deleteLancamento } from '@/services/FinancialService';
import type { LancamentoFinanceiro, FinancialStats, LancamentoFinanceiroData } from '@/services/FinancialService';
import SummaryCard from '@/components/dashboard/SummaryCard';
import TransactionListItem from '@/components/financials/TransactionListItem';
import FinancialsPagination from '@/components/financials/FinancialsPagination';
import FinancialsHeader from '@/components/financials/FinancialsHeader';
import FinancialChart from '@/components/financials/FinancialChart';
import { createFinancialStyles } from '@/styles/financial/FinancialStyles';
import AddEditLancamentoModal from '@/components/financials/AddEditLancamentoModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminRoute } from '@/components/AdminRoute';
import { useTheme } from '@/context/ThemeContext';


const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function FinancialScreen() {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createFinancialStyles(colors), [colors]);
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLancamento, setEditingLancamento] = useState<LancamentoFinanceiro | null>(null);

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

    const handleSave = async (data: LancamentoFinanceiroData) => {
        try {
            setListLoading(true); // Mostra loading na lista
            if (editingLancamento) {
                await updateLancamento(editingLancamento.id_lancamento, data);
                Alert.alert("Sucesso", "Lançamento atualizado.");
            } else {
                await createLancamento(data);
                Alert.alert("Sucesso", "Lançamento criado.");
            }
            setIsModalOpen(false);
            setEditingLancamento(null);
            
            // Recarrega os dados da primeira página e as stats
            if (currentPage !== 1) {
                setCurrentPage(1); 
            } else {
                // Força o recarregamento se já estiver na página 1
                fetchFinancials(1, searchTerm, selectedType);
            }
            // Recarrega as stats
            const statsData = await getFinancialStats();
            setStats(statsData);

        } catch (error) {
            Alert.alert("Erro", "Não foi possível salvar o lançamento.");
            setListLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setListLoading(true);
            await deleteLancamento(id);
            Alert.alert("Sucesso", "Lançamento excluído.");
            setIsModalOpen(false);
            setEditingLancamento(null);
            
            // Recarrega os dados
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchFinancials(1, searchTerm, selectedType);
            }
            // Recarrega as stats
            const statsData = await getFinancialStats();
            setStats(statsData);

        } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o lançamento.");
            setListLoading(false);
        }
    };

    // Função para abrir o modal para ADICIONAR
    const openAddModal = () => {
        setEditingLancamento(null);
        setIsModalOpen(true);
    };

    // Função para abrir o modal para EDITAR
    const openEditModal = (item: LancamentoFinanceiro) => {
        if (item.venda !== null) {
            Alert.alert(
                "Ação não permitida",
                "Lançamentos gerados automaticamente por vendas não podem ser editados ou excluídos manualmente."
            );
            return;
        }
        setEditingLancamento(item);
        setIsModalOpen(true);
    };

    if (initialLoading) {
        return <ActivityIndicator size="large" color={colors.headerBlue} style={{ flex: 1, backgroundColor: colors.background }} />;
    }

    const incomeCardColor = isDark ? '#166534' : '#28a745';
    const expenseCardColor = isDark ? '#7f1d1d' : '#dc3545';
    const balanceCardColor = isDark ? '#0f766e' : '#17a2b8';

    return (
        <AdminRoute>
            <View style={styles.screen}>
                <FlatList
                    data={lancamentos}
                    keyExtractor={(item) => item.id_lancamento.toString()}
                    renderItem={({ item }) => <TransactionListItem item={item} onPress={() => openEditModal(item)} />}
                    ListHeaderComponent={
                        <View>
                            <View style={styles.headerSpacing}>
                                <Text style={styles.pageTitle}>Fluxo de Caixa</Text>
                            </View>
                            {stats && (
                                <View style={styles.cardsSection}>
                                    <View style={styles.cardsRow}>
                                    <SummaryCard title="Entradas" value={formatCurrency(stats.total_entradas)} backgroundColor={incomeCardColor} span="half" />
                                    <SummaryCard title="Saídas" value={formatCurrency(stats.total_saidas)} backgroundColor={expenseCardColor} span="half" />
                                </View>
                                <View style={styles.cardsRowFull}>
                                    <SummaryCard title="Saldo" value={formatCurrency(stats.saldo_atual)} backgroundColor={balanceCardColor} span="full" />
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
                            onAddTransaction={openAddModal} // ATUALIZE AQUI
                        />
                        <Text style={styles.listTitle}>Histórico de Transações</Text>
                    </View>
                }
                ListFooterComponent={
                    listLoading ? <ActivityIndicator style={styles.footerLoader} color={colors.headerBlue} /> : (
                        <FinancialsPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )
                }
                contentContainerStyle={styles.listContent}
                refreshing={listLoading}
                onRefresh={() => fetchFinancials(currentPage, searchTerm, selectedType)}
                showsVerticalScrollIndicator={false}
            />
            <AddEditLancamentoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                initialData={editingLancamento}
            />
            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>
            </View>
        </AdminRoute>
    );
}
