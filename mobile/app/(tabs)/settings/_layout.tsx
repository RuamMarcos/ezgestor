import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Configurações' }} />
      <Stack.Screen name="company-profile" options={{ title: 'Perfil da Empresa' }} />
      <Stack.Screen name="user-management" options={{ title: 'Gerenciamento de Usuários' }} />
    </Stack>
  );
}
