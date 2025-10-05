import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { DashboardColors } from '@/constants/DashboardColors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
}

export default function QuickAddModal({ visible, onClose, onSave }: ModalProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value) {
      Alert.alert("Erro", "O campo não pode estar vazio.");
      return;
    }
    onSave(value);
    setValue(''); // Clear input after saving
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Entrada Rápida de Estoque</Text>
          <Text style={styles.instructions}>
            Digite o código do produto e a quantidade a ser adicionada, separados por dois pontos (ex: 10:12).
          </Text>
          <TextInput
            style={styles.input}
            placeholder="código:quantidade"
            placeholderTextColor={Colors.placeholder}
            value={value}
            onChangeText={setValue}
            autoCapitalize="none"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    instructions: {
        fontSize: 14,
        textAlign: 'center',
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        textAlign: 'center',
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