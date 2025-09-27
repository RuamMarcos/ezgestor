import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/shared/AppHeaderStyles'; 

export default function DashboardHeader() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { logout, user } = useAuth();

  // Pega as iniciais do nome do usuário para exibir no ícone
  const userInitials = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    setDropdownVisible(false);
    logout();
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>EzGestor</Text>

      {/* Ícone de Perfil */}
      <View>
        <TouchableOpacity style={styles.userCircle} onPress={() => setDropdownVisible(true)}>
          <MaterialCommunityIcons name="account" size={24} color={styles.userInitial.color} />
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
            <View style={modalStyles.dropdown}>
              <TouchableOpacity style={modalStyles.dropdownItem} onPress={handleLogout}>
                <MaterialCommunityIcons name="logout" size={20} color="#333" />
                <Text style={modalStyles.dropdownItemText}>Sair</Text>
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