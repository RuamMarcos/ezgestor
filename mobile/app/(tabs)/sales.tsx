import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../utils/api';
import SalesHeader from '@/components/sales/SalesHeader';
import SaleListItem from '@/components/sales/SaleListItem';
import AddSaleModal from '@/components/sales/AddSaleModal';
import EditSaleModal from '@/components/sales/EditSaleModal';
import { styles } from '../../styles/sales/salesStyles';
import { DashboardColors } from '@/constants/DashboardColors';

interface Venda {
  id_venda: number;
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string;
  data_venda: string;
  pago: boolean;
  quantidade?: number;
  imagem_url?: string | null;
}

export default function VendasScreen() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [busca, setBusca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editSale, setEditSale] = useState<Venda | null>(null);

  const buscarVendas = async (page: number, searchTerm: string) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/vendas/', {
        params: {
          search: searchTerm,
          page: page,
        },
      });

      const data = response.data;

      // CORREÇÃO: Sempre substitui os dados em vez de concatenar
      setVendas(data.results);
      setTotalPages(Math.ceil(data.count / 10));

    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || e.message || 'Ocorreu um erro.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaleAdded = () => {
    setModalVisible(false);
    buscarVendas(1, busca); // Recarrega as vendas
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      buscarVendas(1, busca);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [busca]);

  useEffect(() => {
    // CORREÇÃO: Remove a condição e sempre busca quando a página muda
    buscarVendas(currentPage, busca);
  }, [currentPage]);

  const renderPagination = () => {
    if (loading || totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
          // CORREÇÃO: Simplifica a lógica de navegação
          onPress={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          }}
          disabled={currentPage === 1}
        >
          <Text style={styles.paginationButtonText}>Anterior</Text>
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          {currentPage} de {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
          // CORREÇÃO: Simplifica a lógica de navegação
          onPress={() => {
            if (currentPage < totalPages) {
              setCurrentPage(currentPage + 1);
            }
          }}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.paginationButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SalesHeader onAddSale={() => setModalVisible(true)} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por produto ou vendedor..."
            value={busca}
            onChangeText={setBusca}
            placeholderTextColor={DashboardColors.grayText}
          />
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading && currentPage === 1 ? (
            <ActivityIndicator style={styles.loadingIndicator} size="large" color={DashboardColors.headerBlue} />
        ) : (
            <FlatList
              data={vendas}
              renderItem={({ item }) => (
                <SaleListItem item={item} onPress={(v) => setEditSale(v)} />
              )}
              keyExtractor={(item) => item.id_venda.toString()}
              numColumns={2}
              columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingVertical: 8, gap: 12 }}
              ListFooterComponent={renderPagination}
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListText}>Nenhuma venda encontrada.</Text>
                  </View>
                ) : null
              }
            />
        )}
      </View>
      <AddSaleModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSaleAdded={handleSaleAdded}
      />
      <EditSaleModal
        visible={!!editSale}
        sale={editSale as any}
        onClose={() => setEditSale(null)}
        onSaved={() => buscarVendas(currentPage, busca)}
        onDeleted={() => buscarVendas(currentPage, busca)}
      />
    </SafeAreaView>
  );
}