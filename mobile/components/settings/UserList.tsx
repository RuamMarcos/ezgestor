import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TeamMember } from '@/services/TeamService';
import { useTheme } from '@/context/ThemeContext';
import { createStyles } from '@/styles/settings/UserListStyles';

interface UserListProps {
  members: TeamMember[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onMemberPress?: (member: TeamMember) => void;
  searchTerm?: string;
  filterRole?: string;
  ListFooterComponent?: React.ReactElement | null;
}

export default function UserList({
  members,
  loading,
  refreshing,
  onRefresh,
  onMemberPress,
  searchTerm,
  filterRole,
  ListFooterComponent,
}: UserListProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const renderMemberItem = ({ item }: { item: TeamMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {item.first_name.charAt(0)}
          {item.last_name.charAt(0)}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <View style={styles.memberTags}>
          <View
            style={[
              styles.roleTag,
              item.nivel_acesso === 'administrador'
                ? styles.adminTag
                : styles.employeeTag,
            ]}
          >
            <Text
              style={[
                styles.roleTagText,
                item.nivel_acesso === 'administrador'
                  ? styles.adminTagText
                  : styles.employeeTagText,
              ]}
            >
              {item.nivel_acesso === 'administrador'
                ? 'Administrador'
                : 'Funcionário'}
            </Text>
          </View>
          <View
            style={[
              styles.statusTag,
              item.is_active ? styles.activeTag : styles.inactiveTag,
            ]}
          >
            <Text
              style={[
                styles.statusTagText,
                item.is_active ? styles.activeTagText : styles.inactiveTagText,
              ]}
            >
              {item.is_active ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => onMemberPress?.(item)}
      >
        <MaterialCommunityIcons
          name="dots-vertical"
          size={24}
          color={colors.grayText}
        />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="account-group-outline"
        size={80}
        color={colors.grayText}
      />
      <Text style={styles.emptyStateTitle}>Nenhum usuário encontrado</Text>
      <Text style={styles.emptyStateText}>
        {searchTerm || filterRole !== 'todos'
          ? 'Tente ajustar os filtros de busca'
          : 'Adicione o primeiro usuário da equipe'}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={members}
      renderItem={renderMemberItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.headerBlue]}
          tintColor={colors.headerBlue}
        />
      }
      ListEmptyComponent={!loading ? renderEmptyComponent : null}
      ListFooterComponent={ListFooterComponent}
    />
  );
}
