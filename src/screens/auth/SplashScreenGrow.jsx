import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreenGrow({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1.6,
      duration: 1800,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace("LandingStart");
    });
  }, [navigation]);

  return (
    <LinearGradient colors={["#4F8EF7", "#6FA9FF", "#A0C4FF"]} style={styles.container}>
      <Animated.Image
        source={require("../../../assets/Iconpaymate01.png")}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
      />
      {/* <Text style={styles.title}>PayMate</Text> */}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    // marginBottom: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
});