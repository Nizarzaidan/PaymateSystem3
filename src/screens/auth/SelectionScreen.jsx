import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SelectionScreen({ navigation }) {
return (
<LinearGradient colors={["#6FA9FF", "#A0C4FF"]} style={styles.container}>
<StatusBar barStyle="light-content" />

  <View style={styles.content}>
    <Text style={styles.textTop}>Belum punya akun?</Text>
    <Text style={styles.textBottom}>Daftar sekarang.</Text>

    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("LoginScreen")}
    >
      <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.button, { marginTop: 15 }]}
      onPress={() => navigation.navigate("RegisterScreen")}
    >
      <Text style={styles.buttonText}>Register</Text>
    </TouchableOpacity>
  </View>
</LinearGradient>


);
}

const styles = StyleSheet.create({
container: {
flex: 1,
},
content: {
flex: 1,
justifyContent: "center",
alignItems: "center",
},
textTop: {
color: "#fff",
fontSize: 18,
marginBottom: 4,
},
textBottom: {
color: "#fff",
fontSize: 18,
marginBottom: 30,
fontWeight: "600",
},
button: {
width: 180,
height: 45,
borderWidth: 1.5,
borderColor: "#fff",
borderRadius: 25,
alignItems: "center",
justifyContent: "center",
},
buttonText: {
color: "#fff",
fontSize: 16,
fontWeight: "600",
},
});