import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardColors } from '@/constants/DashboardColors';
import { useEffect } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { nivelAcesso, loading } = useAuth();
  const router = useRouter();
  const isAdmin = nivelAcesso === 'administrador';

  useEffect(() => {
    if (!loading && !isAdmin) {
      // Redireciona para vendas se não for admin
      router.replace('/(tabs)/sales');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={80}
          color={DashboardColors.grayText}
        />
        <Text style={styles.title}>Acesso Restrito</Text>
        <Text style={styles.message}>
          Você não tem permissão para acessar esta área.
        </Text>
        <Text style={styles.submessage}>
          Apenas administradores podem visualizar este conteúdo.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: DashboardColors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: DashboardColors.darkText,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: DashboardColors.grayText,
    textAlign: 'center',
    marginBottom: 4,
  },
  submessage: {
    fontSize: 14,
    color: DashboardColors.grayText,
    textAlign: 'center',
  },
});
