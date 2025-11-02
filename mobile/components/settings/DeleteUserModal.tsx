import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { deleteTeamMember, type TeamMember } from '@/services/TeamService';
import { confirm } from '@/utils/confirm';
import { useTheme } from '@/context/ThemeContext';
import { createStyles } from '@/styles/settings/DeleteUserModalStyles';

interface DeleteUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: TeamMember | null;
}

export default function DeleteUserModal({ visible, onClose, onSuccess, member }: DeleteUserModalProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#EF4444"
              />
              <Text style={styles.modalTitle}>Excluir Usuário</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.grayText}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.userInfoCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {member.first_name[0]}
                  {member.last_name[0]}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {member.first_name} {member.last_name}
                </Text>
                <Text style={styles.userEmail}>{member.email}</Text>
                <View style={styles.userTags}>
                  <View
                    style={[
                      styles.tag,
                      member.nivel_acesso === 'administrador'
                        ? styles.adminTag
                        : styles.employeeTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        member.nivel_acesso === 'administrador'
                          ? styles.adminTagText
                          : styles.employeeTagText,
                      ]}
                    >
                      {member.nivel_acesso === 'administrador'
                        ? 'Administrador'
                        : 'Funcionário'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.tag,
                      member.is_active ? styles.activeTag : styles.inactiveTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        member.is_active
                          ? styles.activeTagText
                          : styles.inactiveTagText,
                      ]}
                    >
                      {member.is_active ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.warningSection}>
              <View style={styles.warningCard}>
                <MaterialCommunityIcons
                  name="alert"
                  size={20}
                  color="#F59E0B"
                />
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>Atenção!</Text>
                  <Text style={styles.warningText}>
                    Esta ação é permanente e não pode ser desfeita.
                  </Text>
                </View>
              </View>

              <View style={styles.warningCard}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color={colors.headerBlue}
                />
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>O que acontecerá:</Text>
                  <Text style={styles.warningText}>
                    • O usuário será removido permanentemente do sistema{'\n'}
                    • Todos os dados associados serão mantidos para histórico{'\n'}
                    • O usuário não poderá mais fazer login
                  </Text>
                </View>
              </View>

              <View style={styles.alternativeCard}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={20}
                  color="#10B981"
                />
                <View style={styles.alternativeTextContainer}>
                  <Text style={styles.alternativeTitle}>Alternativa Sugerida</Text>
                  <Text style={styles.alternativeText}>
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
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton, loading && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={isDark ? colors.background : '#FFFFFF'} />
              ) : (
                <>
                  <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Excluir Usuário</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
