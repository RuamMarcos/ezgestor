// app/(tabs)/sales.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Button
} from 'react-native';
import api from '../../utils/api'; 

interface Venda {
  id_venda: number;
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string;
  data_venda: string;
}

export default function VendasScreen() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [busca, setBusca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarVendas = async (page: number) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/vendas/', {
        params: {
          search: busca,
          page: page,
        },
      });

      const data = response.data;
      
      setVendas(data.results);
      setTotalPages(Math.ceil(data.count / 10));

    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || e.message || 'Ocorreu um erro.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
        setCurrentPage(1); 
        buscarVendas(1);
    }, 500); 

    return () => {
      clearTimeout(handler);
    };
  }, [busca]);

  useEffect(() => {
    buscarVendas(currentPage);
  }, [currentPage]);


  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderItemVenda = ({ item }: { item: Venda }) => (
    <View style={styles.itemVendaContainer}>
      <View>
        <Text style={styles.nomeProduto}>{item.nome_produto}</Text>
        <Text style={styles.detalheVenda}>Vendedor: {item.nome_vendedor} - {formatarData(item.data_venda)}</Text>
      </View>
      <Text style={styles.precoVenda}>R$ {parseFloat(item.preco_total).toFixed(2).replace('.', ',')}</Text>
    </View>
  );

  const renderPagination = () => {
    if (loading || vendas.length === 0) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.paginationButtonText}>Anterior</Text>
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          {currentPage} de {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
          onPress={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.paginationButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Vendas</Text>
        
        <TextInput
          style={styles.barraBusca}
          placeholder="Pesquisar por produto ou vendedor..."
          value={busca}
          onChangeText={setBusca}
        />
        
        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading && vendas.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#0000ff" />
        ) : (
            <FlatList
              data={vendas}
              renderItem={renderItemVenda}
              keyExtractor={(item) => item.id_venda.toString()}
              ListFooterComponent={renderPagination}
              ListEmptyComponent={
                !loading ? <Text style={styles.textoVazio}>Nenhuma venda encontrada.</Text> : null
              }
            />
        )}
      </View>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  barraBusca: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  itemVendaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  nomeProduto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detalheVenda: {
    fontSize: 14,
    color: '#666',
  },
  precoVenda: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  textoVazio: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});