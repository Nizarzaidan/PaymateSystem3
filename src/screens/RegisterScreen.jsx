import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const pan = useRef(new Animated.Value(0)).current;

  // Animasi fade-in logo
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Geser seperti Gojek
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= 250) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 200) {
          // kalau geser cukup jauh → masuk Dashboard
          Animated.timing(pan, {
            toValue: 260,
            duration: 150,
            useNativeDriver: true,
          }).start(() => navigation.navigate("Dashboard"));
        } else {
          // kalau belum cukup → balik lagi
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const trackWidth = 320;

  return (
    <LinearGradient
      colors={["#6FB4CC", "#5F78BA"]} // Gradasi biru muda ke biru tua
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* LOGO */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require("../../assets/Screenshot_2025-10-22_213047-removebg-preview.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* SLIDE BUTTON DI BAWAH LAYAR */}
      <View style={[styles.sliderContainer, { width: trackWidth }]}>
        <LinearGradient
          colors={["#5AA5C2", "#4F69B0"]} // Gradasi track yang lebih gelap
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.track}
        >
          <Text style={styles.sliderText}>Geser untuk melanjutkan</Text>
          
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.thumb,
              {
                transform: [{ translateX: pan }],
              },
            ]}
          >
            <Ionicons name="arrow-forward" size={30} color="#fff" />
          </Animated.View>
        </LinearGradient>
      </View>
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
    width: 220,
    height: 220,
    marginBottom: 80,
  },
  // ⬇️ posisi tombol geser di bawah layar
  sliderContainer: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    justifyContent: "center",
  },
  track: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
  },
  sliderText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "500",
  },
  thumb: {
    position: "absolute",
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3A5A9A", // Warna thumb yang lebih gelap
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});