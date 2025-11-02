import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { confirm } from '@/utils/confirm';
import type { LancamentoFinanceiro, LancamentoFinanceiroData } from '@/services/FinancialService';
import { createAddEditModalStyles } from '@/styles/financial/AddEditModalStyles';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LancamentoFinanceiroData) => void;
  onDelete?: (id: number) => void; // Opcional para deletar
  initialData: LancamentoFinanceiro | null;
}

export default function AddEditLancamentoModal({ isOpen, onClose, onSave, onDelete, initialData }: Props) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createAddEditModalStyles(colors, isDark), [colors, isDark]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(''); // Usar string para TextInput
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState('');

  const isEditing = initialData !== null;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDescricao(initialData.descricao);
        setValor(parseFloat(initialData.valor).toString()); // Converter para string
        setTipo(initialData.tipo);
        setCategoria(initialData.categoria || '');
      } else {
        setDescricao('');
        setValor('');
        setTipo('saida');
        setCategoria('');
      }
      setError('');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      setError('O valor deve ser maior que zero.');
      return;
    }
    if (!descricao) {
      setError('A descrição é obrigatória.');
      return;
    }

    onSave({
      descricao,
      valor: valorNum,
      tipo,
      categoria,
    });
  };

  const handleDelete = async () => {
    if (isEditing && onDelete && initialData) {
      const ok = await confirm({
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este lançamento?',
        okText: 'Excluir',
        cancelText: 'Cancelar',
        destructive: true,
      });
      if (ok) onDelete(initialData.id_lancamento);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Ex: Pagamento de fornecedor"
            placeholderTextColor={colors.grayText}
            selectionColor={colors.headerBlue}
            keyboardAppearance={isDark ? 'dark' : 'light'}
          />

          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="Ex: 150,00"
            keyboardType="numeric"
            placeholderTextColor={colors.grayText}
            selectionColor={colors.headerBlue}
            keyboardAppearance={isDark ? 'dark' : 'light'}
          />

          <Text style={styles.label}>Tipo</Text>
          <View style={styles.tipoContainer}>
            <TouchableOpacity 
                style={[styles.tipoButton, tipo === 'saida' && styles.tipoButtonSaida]} 
                onPress={() => setTipo('saida')}>
                <Text style={styles.tipoButtonText}>Saída</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tipoButton, tipo === 'entrada' && styles.tipoButtonEntrada]} 
                onPress={() => setTipo('entrada')}>
                <Text style={styles.tipoButtonText}>Entrada</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Categoria (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Ex: Despesas Fixas"
            placeholderTextColor={colors.grayText}
            selectionColor={colors.headerBlue}
            keyboardAppearance={isDark ? 'dark' : 'light'}
          />

          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={colors.grayText} />
            <Button title={isEditing ? 'Atualizar' : 'Salvar'} onPress={handleSave} color={colors.headerBlue} />
          </View>

          {isEditing && onDelete && (
             <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Excluir Lançamento</Text>
             </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}