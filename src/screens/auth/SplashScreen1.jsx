import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen1({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('SplashGrow');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#6EC1E4', '#4A77C9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Image
        source={require('../../../assets/iconpaymate.png')}
        style={styles.logoSmall}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSmall: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});