import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { updateTeamMember, type TeamMember } from '@/services/TeamService';
import { useTheme } from '@/context/ThemeContext';
import { createStyles } from '@/styles/settings/EditUserModalStyles';

interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: TeamMember | null;
}

interface UpdateTeamMemberData {
  first_name: string;
  last_name: string;
  nivel_acesso: 'administrador' | 'funcionario';
  is_active: boolean;
}

export default function EditUserModal({ visible, onClose, onSuccess, member }: EditUserModalProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateTeamMemberData>({
    first_name: '',
    last_name: '',
    nivel_acesso: 'funcionario',
    is_active: true,
  });

  useEffect(() => {
    if (visible && member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        nivel_acesso: member.nivel_acesso,
        is_active: member.is_active,
      });
      setLoading(false);
      setError(null);
    }
  }, [visible, member]);

  const resetForm = () => {
    if (member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        nivel_acesso: member.nivel_acesso,
        is_active: member.is_active,
      });
    }
  };

  const handleClose = () => {
    resetForm();
    setError(null);
    setLoading(false);
    onClose();
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('Por favor, informe o primeiro nome');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Por favor, informe o sobrenome');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateForm() || !member) return;

    setLoading(true);
    try {
      await updateTeamMember(member.id, formData);
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMessage =
        error.response?.data?.detail ||
        'Erro ao atualizar usuário. Tente novamente.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!member) return null;

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
            <Text style={styles.modalTitle}>Editar Usuário</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.grayText}
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
                placeholderTextColor={colors.grayText}
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
                placeholderTextColor={colors.grayText}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={member.email}
                editable={false}
              />
              <Text style={styles.helperText}>O email não pode ser alterado</Text>
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

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.switchLabel}>Usuário ativo</Text>
                  <Text style={styles.switchDescription}>
                    Desative para impedir o acesso deste usuário ao sistema
                  </Text>
                </View>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value })
                  }
                  disabled={loading}
                  trackColor={{ false: colors.border, true: colors.headerBlue }}
                  thumbColor={formData.is_active ? (isDark ? colors.card : '#FFFFFF') : colors.lightGray}
                />
              </View>
            </View>
          </ScrollView>

          {error && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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
                <ActivityIndicator color={isDark ? colors.background : '#FFFFFF'} />
              ) : (
                <Text style={styles.submitButtonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
