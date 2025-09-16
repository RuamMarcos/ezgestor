import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen 
          name="(auth)/register" 
          options={{
            title: 'Cadastro',
            headerShown: false 
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}