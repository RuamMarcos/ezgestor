import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';
import { createTeamMember, type CreateTeamMemberData } from '@/services/TeamService';
import { styles } from '@/styles/settings/AddUserModalStyles';

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ visible, onClose, onSuccess }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTeamMemberData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    nivel_acesso: 'funcionario',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      nivel_acesso: 'funcionario',
    });
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      Alert.alert('Erro', 'Por favor, informe o primeiro nome');
      return false;
    }
    if (!formData.last_name.trim()) {
      Alert.alert('Erro', 'Por favor, informe o sobrenome');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, informe o email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'Por favor, informe um email válido');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Erro', 'Por favor, informe a senha');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 8 caracteres');
      return false;
    }
    if (formData.password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createTeamMember(formData);
      Alert.alert('Sucesso', 'Usuário adicionado com sucesso!');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error);
      const errorMessage =
        error.response?.data?.email?.[0] === 'user with this email already exists.'
          ? 'Este email já está cadastrado'
          : 'Erro ao adicionar usuário. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Usuário</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={DashboardColors.grayText}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Primeiro Nome <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, first_name: text })
                }
                placeholder="Digite o primeiro nome"
                placeholderTextColor={DashboardColors.grayText}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Sobrenome <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, last_name: text })
                }
                placeholder="Digite o sobrenome"
                placeholderTextColor={DashboardColors.grayText}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Digite o email"
                placeholderTextColor={DashboardColors.grayText}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Senha <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="Digite a senha (mínimo 6 caracteres)"
                placeholderTextColor={DashboardColors.grayText}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Confirmar Senha <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Digite a senha novamente"
                placeholderTextColor={DashboardColors.grayText}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Nível de Acesso <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, nivel_acesso: 'funcionario' })
                  }
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioButton}>
                    {formData.nivel_acesso === 'funcionario' && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <View style={styles.radioLabelContainer}>
                    <Text style={styles.radioLabel}>Funcionário</Text>
                    <Text style={styles.radioDescription}>
                      Acesso limitado às funcionalidades básicas
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, nivel_acesso: 'administrador' })
                  }
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioButton}>
                    {formData.nivel_acesso === 'administrador' && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <View style={styles.radioLabelContainer}>
                    <Text style={styles.radioLabel}>Administrador</Text>
                    <Text style={styles.radioDescription}>
                      Acesso completo a todas as funcionalidades
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Adicionar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
