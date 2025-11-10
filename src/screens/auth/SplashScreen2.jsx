import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-swiper";

export default function SplashScreen2({ navigation }) {
  const handleNext = () => {
  navigation.replace("SelectionScreen");
};

  const handleSkip = () => {
    navigation.replace("SelectionScreen");
  };

  return (
  <LinearGradient colors={["#4F8EF7", "#6FA9FF", "#A0C4FF"]} style={styles.container}>
    <StatusBar hidden />

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Swiper
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        showsButtons={false}
        paginationStyle={styles.pagination}
      >
        <View style={styles.slide}>
          <Image
            source={require("../../../assets/paymate2.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>Catat Keuanganmu</Text>
        </View>

        <View style={styles.slide}>
          <Image
            source={require("../../../assets/paymate3.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>Buat Daftar Tagihan</Text>
        </View>
      </Swiper>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextArrow}>›</Text>
      </TouchableOpacity>
    </LinearGradient>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 10,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 25,
    zIndex: 10,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  nextButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  nextArrow: {
    color: "#fff",
    fontSize: 40,
    lineHeight: 42,
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 3,
  },
  pagination: {
    bottom: 150,
  },
});