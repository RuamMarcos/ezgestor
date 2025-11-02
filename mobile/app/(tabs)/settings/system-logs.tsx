import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Button,
} from 'react-native';
import { AdminRoute } from '@/components/AdminRoute';
import { getLogs } from '@/services/LogService';
import type { RawLog } from '@/types/logs';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '@/styles/settings/LogStyles';
import { Picker } from '@react-native-picker/picker';
import { getTeamMembers } from '@/services/TeamService';
import type { TeamMember } from '@/services/TeamService';

const LogItem = ({ item }: { item: RawLog }) => {
  const formatTimestamp = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <View style={styles.logItemContainer}>
      <Text style={styles.logDescription}>{item.description}</Text>
      <View style={styles.logMetaContainer}>
        <Text style={styles.logMetaText}>
          Usuário: {item.user?.email || 'Sistema'}
        </Text>
        <Text style={styles.logMetaText}>
          Ação: {item.action_type_display}
        </Text>
      </View>
      <Text style={styles.logTimestamp}>
        {formatTimestamp(item.action_time)}
      </Text>
    </View>
  );
};

const ACTION_TYPES = [
  { key: 'CREATE', label: 'Criação' },
  { key: 'UPDATE', label: 'Atualização' },
  { key: 'DELETE', label: 'Deleção' },
  { key: 'SOFT_DELETE', label: 'Desativação' },
  { key: 'LOGIN', label: 'Login' },
];

export default function SystemLogsScreen() {
  const [logs, setLogs] = useState<RawLog[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [appliedUser, setAppliedUser] = useState('');
  const [appliedAction, setAppliedAction] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch (error) {
        console.error('Erro ao buscar membros da equipe:', error);
        setError('Não foi possível carregar a lista de usuários.');
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchLogs = useCallback(
    async (isRefreshing = false) => {
      if (loading || (loadingMore && !isRefreshing)) return;

      const currentPage = isRefreshing ? 1 : page;
      if (isRefreshing) {
        setRefreshing(true);
      } else if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const data = await getLogs(currentPage, appliedUser, appliedAction);

        setLogs(currentPage === 1 ? data.results : [...logs, ...data.results]);
        setHasNextPage(data.next !== null);
        setPage(currentPage + 1);
      } catch (err) {
        setError('Falha ao carregar os logs.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [page, loading, loadingMore, appliedUser, appliedAction]
  );

  useEffect(() => {
    setLogs([]);
    fetchLogs(true);
  }, [appliedUser, appliedAction]);

  const onRefresh = useCallback(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  const handleSearchSubmit = () => {
    setPage(1); // Reseta a página
    setAppliedUser(selectedUser);
    setAppliedAction(selectedAction);
  };

  const handleClearSearch = () => {
    setPage(1);
    setSelectedUser('');
    setSelectedAction('');
    setAppliedUser('');
    setAppliedAction('');
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={DashboardColors.blue} />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filtrar por Usuário</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedUser}
          onValueChange={(itemValue) => setSelectedUser(itemValue)}
          enabled={!isFetchingUsers && !loading}
          style={styles.picker}
        >
          <Picker.Item label="Todos os Usuários" value="" />
          {teamMembers.map((member) => (
            <Picker.Item
              key={member.id}
              label={`${member.email} (${member.first_name})`}
              value={member.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.filterLabel}>Filtrar por Ação</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedAction}
          onValueChange={(itemValue) => setSelectedAction(itemValue)}
          enabled={!loading}
          style={styles.picker}
        >
          <Picker.Item label="Todas as Ações" value="" />
          {ACTION_TYPES.map((action) => (
            <Picker.Item
              key={action.key}
              label={action.label}
              value={action.key}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            title="Limpar"
            onPress={handleClearSearch}
            disabled={loading}
            color={DashboardColors.grayText}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Pesquisar"
            onPress={handleSearchSubmit}
            disabled={loading}
            color={DashboardColors.blue}
          />
        </View>
      </View>
    </View>
  );


  if (loading && !refreshing && logs.length === 0) {
    return (
      <AdminRoute>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={DashboardColors.blue} />
        </View>
      </AdminRoute>
    );
  }

  if (error && logs.length === 0) {
    return (
      <AdminRoute>
        <View style={styles.centered}>
          {/* Renderiza o header mesmo em caso de erro para permitir novos filtros */}
          {renderHeader()} 
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <FlatList
        data={logs}
        renderItem={({ item }) => <LogItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        style={styles.container}
        contentContainerStyle={styles.listContentContainer}
        ListHeaderComponent={renderHeader}
        onEndReached={() => {
          if (hasNextPage && !loadingMore && !loading) {
            fetchLogs(false);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Nenhum log encontrado
              {appliedUser || appliedAction ? ' para os filtros aplicados' : ''}.
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[DashboardColors.blue]}
          />
        }
      />
    </AdminRoute>
  );
}
