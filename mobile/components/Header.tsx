import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface HeaderProps {
    logo?: any;
}

export default function Header({ logo }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Image 
        source={logo || require('../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
});
