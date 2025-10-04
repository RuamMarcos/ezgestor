import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

interface SimpleAddSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSaleAdded: () => void;
}

export default function SimpleAddSaleModal({ visible, onClose, onSaleAdded }: SimpleAddSaleModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Simula uma venda bem-sucedida por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Sucesso', 'Venda registrada com sucesso!');
      onSaleAdded();
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao registrar venda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Venda (Modo Debug)</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.infoText}>
                Este é um modal simplificado para testar se o problema está no modal básico ou nas funcionalidades avançadas.
              </Text>
              
              <Text style={styles.infoText}>
                Se este modal funcionar, o problema está na lógica de produtos ou API.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Aguarde...' : 'Testar Venda'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%' as '80%',
    width: '90%' as '90%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    alignItems: 'center' as 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as '600',
    color: DashboardColors.darkText,
    textAlign: 'center' as 'center',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: DashboardColors.grayText,
  },
  formContainer: {
    gap: 16,
  },
  infoText: {
    fontSize: 14,
    color: DashboardColors.grayText,
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center' as 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: DashboardColors.darkText,
  },
  submitButton: {
    flex: 1,
    backgroundColor: DashboardColors.headerBlue,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center' as 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: DashboardColors.grayText,
  },
};