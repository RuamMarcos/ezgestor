import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/shared/AppHeaderStyles'; 
import { useTheme } from '@/context/ThemeContext';

export default function DashboardHeader() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { logout, user } = useAuth();
  const { colors } = useTheme();

  // Pega as iniciais do nome do usuário para exibir no ícone
  const userInitials = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    setDropdownVisible(false);
    logout();
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <Text style={[styles.headerTitle, { color: colors.headerBlue }]}>EzGestor</Text>

      {/* Ícone de Perfil */}
      <View>
        <TouchableOpacity style={[styles.userCircle, { backgroundColor: colors.lightGray }]} onPress={() => setDropdownVisible(true)}>
          <MaterialCommunityIcons name="account" size={24} color={colors.headerBlue} />
        </TouchableOpacity>

        {/* Menu Dropdown (usando um Modal) */}
        <Modal
          transparent={true}
          visible={isDropdownVisible}
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity 
            style={modalStyles.overlay} 
            activeOpacity={1} 
            onPressOut={() => setDropdownVisible(false)}
          >
            <View style={[modalStyles.dropdown, { backgroundColor: colors.card }]}>
              <TouchableOpacity style={modalStyles.dropdownItem} onPress={handleLogout}>
                <MaterialCommunityIcons name="logout" size={20} color={colors.darkText} />
                <Text style={[modalStyles.dropdownItemText, { color: colors.darkText }]}>Sair</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 85,
    right: 20, 
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});