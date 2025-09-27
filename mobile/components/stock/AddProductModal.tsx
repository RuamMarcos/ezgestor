// mobile/components/stock/AddProductModal.tsx
import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import type { Product } from '../../services/stockService';
import { DashboardColors } from '@/constants/DashboardColors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

interface FormDataState {
  nome: string;
  codigo_do_produto: string;
  preco_venda: string;
  preco_custo: string;
  quantidade_estoque: string;
  quantidade_minima_estoque: string;
}

export default function AddProductModal({ visible, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState<FormDataState>({
    nome: '',
    codigo_do_produto: '',
    preco_venda: '',
    preco_custo: '',
    quantidade_estoque: '',
    quantidade_minima_estoque: '',
  });

  // Função genérica para atualizar o estado do formulário
  const handleChange = (name: keyof FormDataState, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // 2. Converte os valores de string para número ANTES de enviar
    const productData: Product = {
      ...formData,
      preco_venda: parseFloat(formData.preco_venda.replace(',', '.')) || 0,
      preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo.replace(',', '.')) : undefined,
      quantidade_estoque: parseInt(formData.quantidade_estoque, 10) || 0,
      quantidade_minima_estoque: parseInt(formData.quantidade_minima_estoque, 10) || 0,
    };
    if (!productData.nome || !productData.preco_venda) {
        Alert.alert("Erro", "Nome e Preço de Venda são obrigatórios.");
        return;
    }
    onSave(productData);
    // Limpa o formulário após salvar
    setFormData({ nome: '', codigo_do_produto: '', preco_venda: '', preco_custo: '', quantidade_estoque: '', quantidade_minima_estoque: '' });
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.title}>Adicionar Novo Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Produto *"
              value={formData.nome}
              onChangeText={(text) => handleChange('nome', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Código/SKU"
              value={formData.codigo_do_produto}
              onChangeText={(text) => handleChange('codigo_do_produto', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço de Venda *"
              keyboardType="numeric"
              value={formData.preco_venda}
              onChangeText={(text) => handleChange('preco_venda', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço de Custo"
              keyboardType="numeric"
              value={formData.preco_custo}
              onChangeText={(text) => handleChange('preco_custo', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Qtd. em Estoque"
              keyboardType="numeric"
              value={formData.quantidade_estoque}
              onChangeText={(text) => handleChange('quantidade_estoque', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Qtd. Mínima"
              keyboardType="numeric"
              value={formData.quantidade_minima_estoque}
              onChangeText={(text) => handleChange('quantidade_minima_estoque', text)}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ... (os styles continuam os mesmos)
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: DashboardColors.headerBlue,
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});