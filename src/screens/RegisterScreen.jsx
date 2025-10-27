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
          Animated.timing(pan, {
            toValue: 260,
            duration: 150,
            useNativeDriver: true,
          }).start(() => navigation.navigate("Dashboard"));
        } else {
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
      colors={["#3B82F6", "#1E3A8A"]} // 💙 gradasi biru utama
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

      {/* SLIDE BUTTON */}
      <View style={[styles.sliderContainer, { width: trackWidth }]}>
        <LinearGradient
          colors={["#60A5FA", "#2563EB"]} // 💙 gradasi biru untuk track slider
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.track}
        >
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
  thumb: {
    position: "absolute",
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1D4ED8", // biru tua untuk tombol geser
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
