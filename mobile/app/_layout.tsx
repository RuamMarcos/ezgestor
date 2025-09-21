import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen 
          name="(auth)/register" 
          options={{
            title: 'Cadastro',
            headerShown: false 
          }}
        />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}