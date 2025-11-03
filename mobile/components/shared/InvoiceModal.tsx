import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, StyleSheet, TextInput } from 'react-native';
import Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import api from '@/utils/api';
import { createLog } from '@/services/LogService';
import { useTheme } from '@/context/ThemeContext';

type Sale = {
  id_venda: number;
  cliente_nome?: string | null;
  nome_produto: string;
  preco_total: string;
  data_venda: string;
};

interface InvoiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ visible, onClose }: InvoiceModalProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [query, setQuery] = useState('');

  const loadSales = async (q: string = '') => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page_size: 20 };
      const trimmed = q.trim();
      if (trimmed) params.search = trimmed;
      const resp = await api.get('/vendas/', { params });
      setSales(resp.data?.results ?? []);
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao carregar vendas: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    loadSales('');
  }, [visible]);

  const buildInvoiceHtml = (sale: Sale) => {
    return `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding:16px; color:#111 }
          .header { text-align:center; margin-bottom:18px }
          .items { width:100%; border-collapse:collapse }
          .items th, .items td { border:1px solid #ddd; padding:8px }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Danfe - EzGestor</h1>
          <div>Venda: ${sale.id_venda}</div>
          <div>Cliente: ${sale.cliente_nome ?? '—'}</div>
          <div>Data: ${sale.data_venda}</div>
        </div>
        <table class="items">
          <thead>
            <tr><th>Produto</th><th>Valor</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${sale.nome_produto}</td>
              <td>R$ ${sale.preco_total}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:18px">Gerado por EzGestor</div>
      </body>
      </html>
    `;
  };

  const handleEmit = async (sale: Sale) => {
    try {
      setLoading(true);
      const html = buildInvoiceHtml(sale);
      const { uri } = await Print.printToFileAsync({ html });

      const filename = `NFe-${sale.id_venda}.pdf`;

      // Android: oferecer salvar diretamente em uma pasta escolhida (SAF)
      if (Platform.OS === 'android') {
        try {
          const SAF = (FileSystem as any).StorageAccessFramework;
          if (SAF && SAF.requestDirectoryPermissionsAsync) {
            const perm = await SAF.requestDirectoryPermissionsAsync();
            if (perm.granted) {
              const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
              const fileUri = await SAF.createFileAsync(
                perm.directoryUri,
                filename,
                'application/pdf'
              );
              await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' as any });
              Alert.alert('Sucesso', `NF-e salva em: ${fileUri}`);
            } else if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: filename });
            } else {
              Alert.alert('PDF gerado', `Arquivo local: ${uri}`);
            }
          } else if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: filename });
          } else {
            Alert.alert('PDF gerado', `Arquivo local: ${uri}`);
          }
        } catch (androidErr: any) {
          console.log('Erro ao salvar via SAF:', androidErr);
          // fallback: compartilhar
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: filename });
          } else {
            Alert.alert('PDF gerado', `Arquivo local: ${uri}`);
          }
        }
      } else if (Platform.OS === 'web') {
        // Web: fazer download do arquivo
        try {
          const resp = await fetch(uri);
          const blob = await resp.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (webErr) {
          console.log('Erro no download web:', webErr);
          Alert.alert('PDF gerado', 'Não foi possível acionar o download automático no browser.');
        }
      } else {
        // iOS ou outros: compartilhar
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: filename });
        } else {
          Alert.alert('PDF gerado', `Arquivo local: ${uri}`);
        }
      }
      // registra log no backend
      try {
        await createLog({
          action_type: 'CREATE',
          model_name: 'NFe',
          object_id: sale.id_venda,
          description: `Emissão de NF-e da venda #${sale.id_venda}`,
        });
      } catch (logErr) {
        console.log('Falha ao registrar log da emissão:', logErr);
      }
      onClose();
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao gerar PDF: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  // Ordena por data desc e pega as 5 últimas
  const lastFive = [...sales]
    .sort((a, b) => new Date(b.data_venda).getTime() - new Date(a.data_venda).getTime())
    .slice(0, 5);

  const showingSearch = query.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}> 
        <View style={[styles.container, { backgroundColor: colors.card }]}> 
          <Text style={[styles.title, { color: colors.darkText }]}>Emitir NF-e</Text>

          {/* Busca */}
          <View style={styles.searchRow}>
            <TextInput
              placeholder="Buscar por produto ou vendedor"
              placeholderTextColor={colors.grayText}
              style={[styles.searchInput, { borderColor: colors.border, color: colors.darkText }]}
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.headerBlue }]} onPress={() => loadSales(query)}>
              <Text style={styles.searchBtnText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.hint, { color: colors.grayText }]}>
            {showingSearch ? 'Resultados da busca' : 'Últimas 5 vendas'}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.headerBlue} />
          ) : (
            <FlatList
              data={showingSearch ? sales : lastFive}
              keyExtractor={(item) => String(item.id_venda)}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.saleItem, { borderColor: colors.border }]} onPress={() => handleEmit(item)}>
                  <View>
                    <Text style={{ color: colors.darkText, fontWeight: '600' }}>#{item.id_venda} — {item.cliente_nome ?? '—'}</Text>
                    <Text style={{ color: colors.grayText }}>{item.nome_produto}</Text>
                  </View>
                  <Text style={{ color: colors.darkText }}>R$ {item.preco_total}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.headerBlue }]} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  container: { width: '100%', maxHeight: '90%', borderRadius: 12, padding: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  searchBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  hint: { marginBottom: 8 },
  saleItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  closeButton: { marginTop: 10, padding: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontWeight: '600' },
});
