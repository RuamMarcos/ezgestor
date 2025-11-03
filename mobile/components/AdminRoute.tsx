import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { nivelAcesso, loading } = useAuth();
  const { colors } = useTheme();
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={80}
          color={colors.grayText}
        />
        <Text style={[styles.title, { color: colors.darkText }]}>Acesso Restrito</Text>
        <Text style={[styles.message, { color: colors.grayText }]}>
          Você não tem permissão para acessar esta área.
        </Text>
        <Text style={[styles.submessage, { color: colors.grayText }]}>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  submessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});
