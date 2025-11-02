import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AdminRoute } from '@/components/AdminRoute';
import { getLogs } from '@/services/LogService';
import type { RawLog } from '@/types/logs';
import { DashboardColors } from '@/constants/DashboardColors';
import { styles } from '@/styles/settings/LogStyles';

// Componente para renderizar cada item do log
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
          Usuário: {item.user?.username || 'Sistema'}
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

export default function SystemLogsScreen() {
  const [logs, setLogs] = useState<RawLog[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (isRefreshing = false) => {
    if (loading || (loadingMore && !isRefreshing)) return;

    const currentPage = isRefreshing ? 1 : page;
    if (isRefreshing) {
      setRefreshing(true);
    } else if (currentPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await getLogs(currentPage);
      setLogs(currentPage === 1 ? data.results : [...logs, ...data.results]);
      setHasNextPage(data.next !== null);
      setPage(currentPage + 1);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar os logs.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(); // Carga inicial
  }, []);

  const onRefresh = useCallback(() => {
    setLogs([]); // Limpa os logs antes de recarregar
    fetchLogs(true);
  }, []);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={DashboardColors.blue} />
      </View>
    );
  };

  if (loading && !refreshing) {
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
        onEndReached={() => {
          if (hasNextPage && !loadingMore) {
            fetchLogs();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Nenhum log encontrado.</Text>
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