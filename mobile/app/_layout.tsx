<<<<<<< HEAD
// mobile/app/_layout.tsx
=======
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
>>>>>>> d32d01659369fb3130a3f764f80499b8d735d677
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
<<<<<<< HEAD
    <>
      <Stack>
        <Stack.Screen
          name="(auth)/register"
          options={{
            title: 'Cadastro',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="(auth)/plans"
          options={{
            title: 'Planos',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/payment"
          options={{
            title: 'Pagamento',
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
=======
    <GestureHandlerRootView>
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
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
        </SafeAreaProvider>
      </View>
    </GestureHandlerRootView>
>>>>>>> d32d01659369fb3130a3f764f80499b8d735d677
  );
}