// app/(tabs)/sales.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
// Importe a sua instância configurada do Axios
import api from '../../utils/api'; 

// A interface Venda continua a mesma
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
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os dados usando a instância do 'api'
  const buscarVendas = async (novaBusca = false) => {
    if (loading || (!hasMore && !novaBusca)) return;

    setLoading(true);
    setError(null);
    
    const paginaAtual = novaBusca ? 1 : pagina;
    if (novaBusca) {
      setVendas([]);
    }

    try {
      // Usamos 'api.get' e ele já inclui o token de autorização!
      const response = await api.get('/vendas/', {
        params: {
          search: busca,
          page: paginaAtual,
        },
      });

      const data = response.data;
      
      setVendas(prevVendas => novaBusca ? data.results : [...prevVendas, ...data.results]);
      setHasMore(data.next !== null);

      if (data.next !== null) {
          setPagina(paginaAtual + 1);
      }

    } catch (e: any) {
      // O Axios encapsula os erros de forma um pouco diferente
      const errorMessage = e.response?.data?.detail || e.message || 'Ocorreu um erro.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os dados quando o componente é montado
  useEffect(() => {
    buscarVendas(true);
  }, []);

  // Efeito para realizar uma nova busca com debounce
  useEffect(() => {
    const handler = setTimeout(() => {
        setHasMore(true);
        setPagina(1);
        buscarVendas(true);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [busca]);


  // Função para formatar a data que vem da API
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // O restante do componente (renderItemVenda, renderFooter, JSX, styles) permanece exatamente o mesmo...

  // Componente que renderiza cada item da lista de vendas
  const renderItemVenda = ({ item }: { item: Venda }) => (
    <View style={styles.itemVendaContainer}>
      <View>
        <Text style={styles.nomeProduto}>{item.nome_produto}</Text>
        <Text style={styles.detalheVenda}>Vendedor: {item.nome_vendedor} - {formatarData(item.data_venda)}</Text>
      </View>
      <Text style={styles.precoVenda}>R$ {parseFloat(item.preco_total).toFixed(2).replace('.', ',')}</Text>
    </View>
  );

  // Componente a ser exibido no rodapé da lista (indicador de carregamento)
  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#0000ff" />;
  };

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

        <FlatList
          data={vendas}
          renderItem={renderItemVenda}
          keyExtractor={(item) => item.id_venda.toString()}
          onEndReached={() => buscarVendas()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading ? <Text style={styles.textoVazio}>Nenhuma venda encontrada.</Text> : null
          }
        />
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
  }
});