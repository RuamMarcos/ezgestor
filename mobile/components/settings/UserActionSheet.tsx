import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
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
  const { colors } = useTheme();
  const dynamicStyles = styles(colors);
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={dynamicStyles.modalOverlay} onPress={onClose}>
        <Pressable style={dynamicStyles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>{userName}</Text>
          </View>

          <View style={dynamicStyles.actionsList}>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => {
                onClose();
                onEdit();
              }}
              activeOpacity={0.7}
            >
              <View style={dynamicStyles.actionIconContainer}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={22}
                  color={colors.headerBlue}
                />
              </View>
              <Text style={dynamicStyles.actionText}>Editar Usuário</Text>
            </TouchableOpacity>

            <View style={dynamicStyles.divider} />

            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => {
                onClose();
                onDelete();
              }}
              activeOpacity={0.7}
            >
              <View style={dynamicStyles.actionIconContainer}>
                <MaterialCommunityIcons name="delete" size={22} color="#EF4444" />
              </View>
              <Text style={[dynamicStyles.actionText, dynamicStyles.deleteText]}>
                Excluir Usuário
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={dynamicStyles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={dynamicStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
