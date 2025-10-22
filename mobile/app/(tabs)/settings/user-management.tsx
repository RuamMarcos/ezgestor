import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors } from '@/constants/DashboardColors';
import { getTeamMembers, type TeamMember } from '@/services/TeamService';
import AddUserModal from '@/components/settings/AddUserModal';
import UserList from '@/components/settings/UserList';
import { styles } from '@/styles/settings/UserManagementStyles';

export default function UserManagementScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    let result = [...members];

    if (searchTerm) {
      result = result.filter(
        (member) =>
          `${member.first_name} ${member.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'todos') {
      result = result.filter((member) => member.nivel_acesso === filterRole);
    }

    setFilteredMembers(result);
  }, [members, searchTerm, filterRole]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    fetchMembers();
  };

  const handleMemberPress = (member: TeamMember) => {
    // TODO: Implementar ações ao clicar no usuário (editar/excluir)
    console.log('Member pressed:', member);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={DashboardColors.headerBlue}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gerenciamento de Usuários</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DashboardColors.headerBlue} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={DashboardColors.headerBlue}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gerenciamento de Usuários</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar Usuário</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={DashboardColors.grayText}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={DashboardColors.grayText}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterRole === 'todos' && styles.filterChipActive,
            ]}
            onPress={() => setFilterRole('todos')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterRole === 'todos' && styles.filterChipTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterRole === 'administrador' && styles.filterChipActive,
            ]}
            onPress={() => setFilterRole('administrador')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterRole === 'administrador' && styles.filterChipTextActive,
              ]}
            >
              Administrador
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterRole === 'funcionario' && styles.filterChipActive,
            ]}
            onPress={() => setFilterRole('funcionario')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterRole === 'funcionario' && styles.filterChipTextActive,
              ]}
            >
              Funcionário
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <UserList
        members={filteredMembers}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onMemberPress={handleMemberPress}
        searchTerm={searchTerm}
        filterRole={filterRole}
      />

      <AddUserModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
    </View>
  );
}
