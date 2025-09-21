import { Link } from 'expo-router';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao EzGestor</Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/register" asChild>
          <Button title="Criar Conta" />
        </Link>
      </View>
      
      <View style={styles.buttonContainer}>
        <Link href="/dashboard" asChild>
          <Button title="Entrar" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '60%',
  }
});