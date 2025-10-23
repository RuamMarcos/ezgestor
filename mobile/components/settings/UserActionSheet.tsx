import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '@/styles/settings/UserActionSheetStyles';

interface UserActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  userName: string;
}

export default function UserActionSheet({
  visible,
  onClose,
  onEdit,
  onDelete,
  userName,
}: UserActionSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{userName}</Text>
          </View>

          <View style={styles.actionsList}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onClose();
                onEdit();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={22}
                  color={DashboardColors.headerBlue}
                />
              </View>
              <Text style={styles.actionText}>Editar Usuário</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onClose();
                onDelete();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons name="delete" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.actionText, styles.deleteText]}>
                Excluir Usuário
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
