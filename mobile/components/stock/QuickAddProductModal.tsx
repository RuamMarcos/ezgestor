import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import type { Product } from '../../services/StockService';
import { useTheme } from '@/context/ThemeContext';
import type { ThemeColors } from '@/context/ThemeContext';

interface QuickAddProductModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onSave: (productId: number, quantity: number) => void;
}

const QuickAddProductModal: React.FC<QuickAddProductModalProps> = ({ product, visible, onClose, onSave }) => {
  const [quantity, setQuantity] = useState('');
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  if (!product) {
    return null;
  }

  const handleSave = () => {
    const numQuantity = parseInt(quantity, 10);
    if (!isNaN(numQuantity) && numQuantity > 0) {
      onSave(product.id_produto!, numQuantity);
      setQuantity('');
    } else {
      alert('Por favor, insira uma quantidade válida.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Adicionar Estoque</Text>
          <Text style={styles.productName}>Produto: {product.nome}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Quantidade a adicionar"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholderTextColor={colors.grayText}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  productName: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: colors.grayText,
  },
  input: {
    height: 40,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 5,
    backgroundColor: colors.background,
    color: colors.darkText,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '48%',
  },
  buttonClose: {
    backgroundColor: colors.lightGray,
  },
  buttonSave: {
    backgroundColor: colors.headerBlue,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.darkText,
  },
  buttonTextPrimary: {
    color: isDark ? colors.card : '#FFFFFF',
  },
});

export default QuickAddProductModal;