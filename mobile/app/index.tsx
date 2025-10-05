import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { styles } from '../styles/IndexStyles';
import { landingPageColors } from '../constants/IndexColors';

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[landingPageColors.gradientStart, landingPageColors.gradientEnd]}
        style={styles.container}
      >
        <Image 
          source={require('../assets/images/white-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.slogan}>
          Controle vendas, estoque, fluxo de caixa e muito mais em uma única plataforma.
        </Text>

        <View style={styles.buttonContainer}>
          <Link href="/register" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Começar Grátis</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}