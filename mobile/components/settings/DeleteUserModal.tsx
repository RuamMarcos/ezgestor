import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { deleteTeamMember, type TeamMember } from '@/services/TeamService';
import { confirm } from '@/utils/confirm';
import { styles } from '@/styles/settings/DeleteUserModalStyles';

interface DeleteUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: TeamMember | null;
}

export default function DeleteUserModal({ visible, onClose, onSuccess, member }: DeleteUserModalProps) {
  const { colors } = useTheme();
  const dynamicStyles = styles(colors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setLoading(false);
      setError(null);
    }
  }, [visible]);

  const handleDelete = async () => {
    if (!member) return;

    const ok = await confirm({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      okText: 'Excluir',
      cancelText: 'Cancelar',
      destructive: true,
    });

    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      await deleteTeamMember(member.id);
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      const errorMessage =
        error.response?.data?.detail ||
        'Erro ao excluir usuário. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <View style={dynamicStyles.headerTitleContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#EF4444"
              />
              <Text style={dynamicStyles.modalTitle}>Excluir Usuário</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.grayText}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={dynamicStyles.userInfoCard}>
              <View style={dynamicStyles.userAvatar}>
                <Text style={dynamicStyles.userAvatarText}>
                  {member.first_name[0]}
                  {member.last_name[0]}
                </Text>
              </View>
              <View style={dynamicStyles.userInfo}>
                <Text style={dynamicStyles.userName}>
                  {member.first_name} {member.last_name}
                </Text>
                <Text style={dynamicStyles.userEmail}>{member.email}</Text>
                <View style={dynamicStyles.userTags}>
                  <View
                    style={[
                      dynamicStyles.tag,
                      member.nivel_acesso === 'administrador'
                        ? dynamicStyles.adminTag
                        : dynamicStyles.employeeTag,
                    ]}
                  >
                    <Text
                      style={[
                        dynamicStyles.tagText,
                        member.nivel_acesso === 'administrador'
                          ? dynamicStyles.adminTagText
                          : dynamicStyles.employeeTagText,
                      ]}
                    >
                      {member.nivel_acesso === 'administrador'
                        ? 'Administrador'
                        : 'Funcionário'}
                    </Text>
                  </View>
                  <View
                    style={[
                      dynamicStyles.tag,
                      member.is_active ? dynamicStyles.activeTag : dynamicStyles.inactiveTag,
                    ]}
                  >
                    <Text
                      style={[
                        dynamicStyles.tagText,
                        member.is_active
                          ? dynamicStyles.activeTagText
                          : dynamicStyles.inactiveTagText,
                      ]}
                    >
                      {member.is_active ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={dynamicStyles.warningSection}>
              <View style={dynamicStyles.warningCard}>
                <MaterialCommunityIcons
                  name="alert"
                  size={20}
                  color="#F59E0B"
                />
                <View style={dynamicStyles.warningTextContainer}>
                  <Text style={dynamicStyles.warningTitle}>Atenção!</Text>
                  <Text style={dynamicStyles.warningText}>
                    Esta ação é permanente e não pode ser desfeita.
                  </Text>
                </View>
              </View>

              <View style={dynamicStyles.warningCard}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color={colors.headerBlue}
                />
                <View style={dynamicStyles.warningTextContainer}>
                  <Text style={dynamicStyles.warningTitle}>O que acontecerá:</Text>
                  <Text style={dynamicStyles.warningText}>
                    • O usuário será removido permanentemente do sistema{'\n'}
                    • Todos os dados associados serão mantidos para histórico{'\n'}
                    • O usuário não poderá mais fazer login
                  </Text>
                </View>
              </View>

              <View style={dynamicStyles.alternativeCard}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={20}
                  color="#10B981"
                />
                <View style={dynamicStyles.alternativeTextContainer}>
                  <Text style={dynamicStyles.alternativeTitle}>Alternativa Sugerida</Text>
                  <Text style={dynamicStyles.alternativeText}>
                    Se você deseja apenas impedir que o usuário acesse o sistema
                    temporariamente, considere desativá-lo em vez de excluí-lo.
                    Usuários inativos não podem fazer login, mas podem ser
                    reativados posteriormente.
                  </Text>
                </View>
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
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.deleteButton, loading && dynamicStyles.buttonDisabled]}
              onPress={handleDelete}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
                  <Text style={dynamicStyles.deleteButtonText}>Excluir Usuário</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
