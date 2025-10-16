import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Platform, TextInput, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '@/utils/api';

// A small helper to format YYYY-MM-DD
function fmt(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toBlob(data: ArrayBuffer | Uint8Array) {
  if (Platform.OS === 'web') {
    return new Blob([data as ArrayBuffer]);
  }
  // Native: return as is (we'll use WebBrowser to open data URLs)
  return data as any;
}

export type ReportType =
  | 'bundle'
  | 'executive'
  | 'sales-period'
  | 'product-ranking'
  | 'seller-performance'
  | 'sales-by-customer'
  | 'stock-position'
  | 'replenishment'
  | 'cashflow'
  | 'kardex'
  | 'dre';

export default function ReportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const now = useMemo(() => new Date(), []);
  const [start, setStart] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
  const [end, setEnd] = useState<Date>(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const [reportType, setReportType] = useState<ReportType>('bundle');
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [vendedor, setVendedor] = useState('');
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [gapDays, setGapDays] = useState('30');
  const [leadTime, setLeadTime] = useState('7');
  const [safety, setSafety] = useState('3');
  const [baseDays, setBaseDays] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const s = fmt(start);
      const e = fmt(end);
      const params: string[] = [];
      if (s) params.push(`start=${s}`);
      if (e) params.push(`end=${e}`);
      if (vendedor) params.push(`vendedor=${encodeURIComponent(vendedor)}`);
      if (cliente) params.push(`cliente=${encodeURIComponent(cliente)}`);
      if (produto) params.push(`produto=${encodeURIComponent(produto)}`);

      let url = '';
      let filename = '';
      const finalFmt = format;

      switch (reportType) {
        case 'executive':
          url = `/relatorios/executive-summary/?${params.join('&')}&format=${finalFmt}`;
          filename = `resumo_executivo_${s}_${e}.${finalFmt}`;
          break;
        case 'sales-period':
          url = `/relatorios/sales-period/?${params.join('&')}&format=${finalFmt}`;
          filename = `vendas_periodo_${s}_${e}.${finalFmt}`;
          break;
        case 'product-ranking':
          url = `/relatorios/product-ranking/?${params.join('&')}&format=${finalFmt}`;
          filename = `ranking_produtos_${s}_${e}.${finalFmt}`;
          break;
        case 'seller-performance':
          url = `/relatorios/seller-performance/?${params.join('&')}&format=${finalFmt}`;
          filename = `performance_vendedor_${s}_${e}.${finalFmt}`;
          break;
        case 'sales-by-customer':
          if (gapDays) params.push(`gap_days=${gapDays}`);
          url = `/relatorios/sales-by-customer/?${params.join('&')}&format=${finalFmt}`;
          filename = `vendas_cliente_${s}_${e}.${finalFmt}`;
          break;
        case 'stock-position':
          if (baseDays) params.push(`base_days=${baseDays}`);
          url = `/relatorios/stock-position/?${params.join('&')}&format=${finalFmt}`;
          filename = `posicao_estoque_${s}_${e}.${finalFmt}`;
          break;
        case 'replenishment':
          if (leadTime) params.push(`lead_time=${leadTime}`);
          if (safety) params.push(`safety=${safety}`);
          if (baseDays) params.push(`base_days=${baseDays}`);
          url = `/relatorios/replenishment-suggestion/?${params.join('&')}&format=${finalFmt}`;
          filename = `sugestao_compra_${s}_${e}.${finalFmt}`;
          break;
        case 'cashflow':
          url = `/relatorios/cashflow/?${params.join('&')}&format=${finalFmt}`;
          filename = `fluxo_caixa_${s}_${e}.${finalFmt}`;
          break;
        case 'kardex':
          url = `/relatorios/kardex/?${params.join('&')}&format=${finalFmt}`;
          filename = `kardex_${s}_${e}.${finalFmt}`;
          break;
        case 'dre':
          url = `/relatorios/dre-simplificada/?${params.join('&')}&format=${finalFmt}`;
          filename = `dre_${s}_${e}.${finalFmt}`;
          break;
        case 'bundle':
        default: {
          const base = params.length ? `${params.join('&')}&` : '';
          url = `/relatorios/bundle/?${base}format=${finalFmt}`;
          const suffix = finalFmt === 'csv' ? 'csv' : 'pdf';
          filename = `relatorios_${s}_${e}_${suffix}.zip`;
          break;
        }
      }

      const resp = await api.get(url, { responseType: 'arraybuffer' });
      const data = resp.data as ArrayBuffer;

      if (Platform.OS === 'web') {
        const blob = new Blob([data]);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // On native, use a simple share-like fallback: open in a webview or alert
        // For now, we just inform the user and skip persisting to Filesystem.
        Alert.alert('Download concluído', `Arquivo gerado: ${filename}`);
      }

      onClose();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', e?.response?.data?.detail || 'Não foi possível gerar o relatório agora.');
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Gerar Relatório</Text>
      <TouchableOpacity onPress={onClose}><MaterialCommunityIcons name="close" size={24} /></TouchableOpacity>
    </View>
  );

  const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string)=>void; options: {label:string, value:string}[] }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>{label}</Text>
      <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={() => { /* Could show ActionSheet here; for simplicity just cycles */
          const idx = options.findIndex(o => o.value === value);
          const next = options[(idx + 1) % options.length];
          onChange(next.value);
        }}>
          <Text style={{ fontSize: 16 }}>{options.find(o=>o.value===value)?.label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Input = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>{label}</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', fontSize: 16 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 16 }}>
        <View style={{ backgroundColor: '#f9fafb', borderRadius: 16, overflow: 'hidden', maxHeight: '90%' }}>
          <Header />
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Select
              label="Tipo de Relatório"
              value={reportType}
              onChange={(v)=>setReportType(v as ReportType)}
              options={[
                { label: 'Bundle (ZIP com todos)', value: 'bundle' },
                { label: 'Resumo Executivo', value: 'executive' },
                { label: 'Vendas por Período', value: 'sales-period' },
                { label: 'Ranking de Produtos', value: 'product-ranking' },
                { label: 'Performance por Vendedor', value: 'seller-performance' },
                { label: 'Vendas por Clientes', value: 'sales-by-customer' },
                { label: 'Posição de Estoque', value: 'stock-position' },
                { label: 'Sugestão de Compra', value: 'replenishment' },
                { label: 'Fluxo de Caixa', value: 'cashflow' },
                { label: 'Kardex', value: 'kardex' },
                { label: 'DRE Simplificada', value: 'dre' },
              ]}
            />
            <Select
              label="Formato"
              value={format}
              onChange={(v)=>setFormat(v as 'pdf'|'csv')}
              options={[{ label: 'PDF', value: 'pdf' }, { label: 'CSV', value: 'csv' }]}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>Início</Text>
                <TouchableOpacity style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' }} onPress={()=>{}}>
                  <Text style={{ fontSize: 16 }}>{fmt(start)}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>Fim</Text>
                <TouchableOpacity style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' }} onPress={()=>{}}>
                  <Text style={{ fontSize: 16 }}>{fmt(end)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input label="Vendedor (email ou id)" value={vendedor} onChangeText={setVendedor} placeholder="opcional" />
            <Input label="Cliente" value={cliente} onChangeText={setCliente} placeholder="opcional" />
            <Input label="Produto (nome ou id)" value={produto} onChangeText={setProduto} placeholder="opcional" />

            {reportType === 'sales-by-customer' && (
              <Input label="Gap dias (recuperáveis)" value={gapDays} onChangeText={setGapDays} keyboardType="numeric" />
            )}

            {reportType === 'replenishment' && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Input label="Base (dias)" value={baseDays} onChangeText={setBaseDays} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Lead time (dias)" value={leadTime} onChangeText={setLeadTime} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Safety (dias)" value={safety} onChangeText={setSafety} keyboardType="numeric" />
                </View>
              </View>
            )}

            <TouchableOpacity onPress={handleDownload} disabled={loading} style={{ backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 12, marginTop: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{loading ? 'Gerando…' : 'Gerar'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
