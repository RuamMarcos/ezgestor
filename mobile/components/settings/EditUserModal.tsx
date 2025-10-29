import React, { useState, useEffect } from 'react';
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
import { useTheme } from '@/context/ThemeContext';
import { updateTeamMember, type TeamMember } from '@/services/TeamService';
import { styles } from '@/styles/settings/EditUserModalStyles';

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
  const { colors } = useTheme();
  const dynamicStyles = styles(colors);
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
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <Text style={dynamicStyles.modalTitle}>Editar Usuário</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.grayText}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>
                Primeiro Nome <Text style={dynamicStyles.required}>*</Text>
              </Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.first_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, first_name: text })
                }
                placeholder="Digite o primeiro nome"
                placeholderTextColor={colors.grayText}
                editable={!loading}
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>
                Sobrenome <Text style={dynamicStyles.required}>*</Text>
              </Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.last_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, last_name: text })
                }
                placeholder="Digite o sobrenome"
                placeholderTextColor={colors.grayText}
                editable={!loading}
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Email</Text>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.inputDisabled]}
                value={member.email}
                editable={false}
              />
              <Text style={dynamicStyles.helperText}>O email não pode ser alterado</Text>
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>
                Nível de Acesso <Text style={dynamicStyles.required}>*</Text>
              </Text>
              <View style={dynamicStyles.radioGroup}>
                <TouchableOpacity
                  style={dynamicStyles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, nivel_acesso: 'funcionario' })
                  }
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={dynamicStyles.radioButton}>
                    {formData.nivel_acesso === 'funcionario' && (
                      <View style={dynamicStyles.radioButtonSelected} />
                    )}
                  </View>
                  <View style={dynamicStyles.radioLabelContainer}>
                    <Text style={dynamicStyles.radioLabel}>Funcionário</Text>
                    <Text style={dynamicStyles.radioDescription}>
                      Acesso limitado às funcionalidades básicas
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={dynamicStyles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, nivel_acesso: 'administrador' })
                  }
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={dynamicStyles.radioButton}>
                    {formData.nivel_acesso === 'administrador' && (
                      <View style={dynamicStyles.radioButtonSelected} />
                    )}
                  </View>
                  <View style={dynamicStyles.radioLabelContainer}>
                    <Text style={dynamicStyles.radioLabel}>Administrador</Text>
                    <Text style={dynamicStyles.radioDescription}>
                      Acesso completo a todas as funcionalidades
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={dynamicStyles.formGroup}>
              <View style={dynamicStyles.switchContainer}>
                <View style={dynamicStyles.switchLabelContainer}>
                  <Text style={dynamicStyles.switchLabel}>Usuário ativo</Text>
                  <Text style={dynamicStyles.switchDescription}>
                    Desative para impedir o acesso deste usuário ao sistema
                  </Text>
                </View>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value })
                  }
                  disabled={loading}
                  trackColor={{ false: colors.lightGray, true: colors.headerBlue }}
                  thumbColor={formData.is_active ? colors.background : colors.lightGray}
                />
              </View>
            </View>
          </ScrollView>

          {error && (
            <View style={dynamicStyles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
              <Text style={dynamicStyles.errorText}>{error}</Text>
            </View>
          )}

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.submitButton, loading && dynamicStyles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={dynamicStyles.submitButtonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
