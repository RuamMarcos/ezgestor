import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/dashboard/HeaderStyles';

export default function DashboardHeader() {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>EzGestor</Text>
      <View style={styles.userCircle}>
        <Text style={styles.userInitial}>JS</Text>
      </View>
    </View>
  );
}