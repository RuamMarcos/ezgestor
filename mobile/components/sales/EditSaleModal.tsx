import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';
import { updateSale, deleteSale } from '../../services/SalesService';

interface VendaDetail {
  id_venda: number;
  nome_produto: string;
  nome_vendedor: string;
  quantidade: number;
  preco_total: string;
  data_venda: string;
  cliente_nome?: string | null;
  cliente_email?: string | null;
  cliente_telefone?: string | null;
}

interface Props {
  visible: boolean;
  sale: VendaDetail | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function EditSaleModal({ visible, sale, onClose, onSaved, onDeleted }: Props) {
  const [form, setForm] = useState({ quantidade: 1, cliente_nome: '', cliente_email: '', cliente_telefone: '' });

  useEffect(() => {
    if (sale) {
      setForm({
        quantidade: sale.quantidade ?? 1,
        cliente_nome: sale.cliente_nome ?? '',
        cliente_email: sale.cliente_email ?? '',
        cliente_telefone: sale.cliente_telefone ?? '',
      });
    }
  }, [sale]);

  if (!visible || !sale) return null as any;

  const handleSave = async () => {
    try {
      await updateSale(sale.id_venda, {
        quantidade: form.quantidade,
        cliente_nome: form.cliente_nome || null,
        cliente_email: form.cliente_email || null,
        cliente_telefone: form.cliente_telefone || null,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.quantidade || e?.response?.data?.detail || 'Falha ao salvar.';
      Alert.alert('Erro', typeof msg === 'string' ? msg : 'Falha ao salvar.');
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirmar', 'Deseja excluir esta venda?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await deleteSale(sale.id_venda);
          onDeleted();
          onClose();
        } catch {
          Alert.alert('Erro', 'Falha ao excluir.');
        }
      }}
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Editar Venda</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 20 }}>×</Text></TouchableOpacity>
          </View>

          <Text style={{ color: '#555' }}>Produto</Text>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>{sale.nome_produto}</Text>

          <Text style={{ color: '#555' }}>Quantidade</Text>
          <TextInput
            value={String(form.quantidade)}
            onChangeText={(t) => setForm((p) => ({ ...p, quantidade: parseInt(t || '0') || 0 }))}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}
          />

          <Text style={{ color: '#555' }}>Cliente - Nome</Text>
          <TextInput value={form.cliente_nome} onChangeText={(t) => setForm((p) => ({ ...p, cliente_nome: t }))} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginBottom: 8 }} />

          <Text style={{ color: '#555' }}>Cliente - Telefone</Text>
          <TextInput value={form.cliente_telefone} onChangeText={(t) => setForm((p) => ({ ...p, cliente_telefone: t }))} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginBottom: 8 }} />

          <Text style={{ color: '#555' }}>Cliente - E-mail</Text>
          <TextInput value={form.cliente_email} onChangeText={(t) => setForm((p) => ({ ...p, cliente_email: t }))} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginBottom: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <TouchableOpacity onPress={handleDelete} style={{ backgroundColor: '#dc2626', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Excluir</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={onClose} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginRight: 8 }}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={{ backgroundColor: DashboardColors.headerBlue, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
