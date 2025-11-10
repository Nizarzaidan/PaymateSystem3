import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Checkbox } from "expo-checkbox";

export default function LandingStartScreen({ navigation }) {
  const [isChecked, setChecked] = useState(false);

  return (
    <LinearGradient colors={["#4F8EF7", "#6FB1FC"]} style={styles.container}>
      <StatusBar hidden />
      <Image
        source={require("../../../assets/Iconpaymate01.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.bottomContainer}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "#fff" : undefined}
          />
          <Text style={styles.text}>
            I agree <Text style={styles.link}>Terms of Use</Text> &{" "}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !isChecked && { opacity: 0.6 }]}
          onPress={() => {
            if (isChecked) {
              navigation.replace("Splash2");
            } else {
              alert("Please agree to continue");
            }
          }}
        >
          <Text style={styles.buttonText}>Let's Begin</Text>
        </TouchableOpacity>
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
    width: 150,
    height: 150,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  text: {
    color: "#fff",
    marginLeft: 8,
  },
  link: {
    textDecorationLine: "underline",
    color: "#fff",
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});