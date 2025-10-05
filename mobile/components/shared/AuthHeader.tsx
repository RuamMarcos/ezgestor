import React from 'react';
import { View, Image } from 'react-native';
import { styles } from '../../styles/shared/AuthHeaderStyles';

interface HeaderProps {
    logo?: any;
}

export default function AuthHeader({ logo }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Image 
        source={logo || require('../../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}