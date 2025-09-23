import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasActiveSubscription } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Don't run redirects until loading is complete
    if (loading) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';

    // If the user is not logged in, redirect them to the login screen
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    // If the user is logged in but does not have an active subscription,
    // and they are trying to access a screen inside the (tabs) group,
    // redirect them to the plans screen.
    if (user && !hasActiveSubscription && inTabsGroup) {
      router.replace('/(auth)/plans');
      return;
    }

    // If the user is logged in and has an active subscription,
    // but they are on a page in the (auth) group (like login/register/plans),
    // redirect them to the dashboard.
    if (user && hasActiveSubscription && !inTabsGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [loading, user, hasActiveSubscription, segments]);

  // Enquanto o AuthContext está carregando o usuário, mostre um spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Se o usuário estiver logado, renderiza a tela solicitada
  if (user) {
    return <>{children}</>;
  }
  return null;
}