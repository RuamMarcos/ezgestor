import { View, Text, StyleSheet } from 'react-native';

export default function VendasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Vendas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});