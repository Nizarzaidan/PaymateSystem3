import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BASE_URL } from "../../api/apiClient";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: ""
  });

  // Load saved credentials when component mounts
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem("savedUsername");
      const savedPassword = await AsyncStorage.getItem("savedPassword");
      const rememberMeStatus = await AsyncStorage.getItem("rememberMe");
      
      if (savedUsername && rememberMeStatus === "true") {
        setUsername(savedUsername);
        if (savedPassword) {
          setPassword(savedPassword);
        }
        setRememberMe(true);
      }
    } catch (error) {
      console.log("Error loading saved credentials:", error);
    }
  };

  const saveCredentials = async (email, pwd) => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem("savedUsername", email);
        await AsyncStorage.setItem("savedPassword", pwd);
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        // Hapus saved credentials jika remember me tidak dicentang
        await AsyncStorage.multiRemove(["savedUsername", "savedPassword", "rememberMe"]);
      }
    } catch (error) {
      console.log("Error saving credentials:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
      general: ""
    };

    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Username/Email harus diisi";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(username) && username.length < 3) {
      newErrors.username = "Format email tidak valid atau username terlalu pendek";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    } else if (password.length < 4) {
      newErrors.password = "Password minimal 4 karakter";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => {
    setErrors({
      username: "",
      password: "",
      general: ""
    });
  };

  const handleLogin = async () => {
    // Clear previous errors
    clearErrors();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Attempting login with:", { username, password });

      const response = await axios.post(
        `${BASE_URL}/pengguna/login`,
        {
          email: username,
          kataSandiHash: password,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("✅ Login response:", response.data);

      const { code, message, data, token } = response.data;

      if (code === 200 && token) {
        console.log("✅ Login successful, saving token...");
        
        // Save credentials if remember me is checked
        await saveCredentials(username, password);
        
        await AsyncStorage.setItem("jwtToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(data));
        
        console.log("✅ Token saved, navigating to Dashboard...");
        navigation.replace("Dashboard");
      } else {
        setErrors({
          ...errors,
          general: message || "Login gagal!"
        });
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      
      if (error.response?.status === 401) {
        // Handle unauthorized (wrong credentials)
        setErrors({
          ...errors,
          general: "Email atau password salah. Silakan coba lagi."
        });
      } else if (error.request) {
        setErrors({
          ...errors,
          general: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        });
      } else {
        setErrors({
          ...errors,
          general: "Terjadi kesalahan saat login. Silakan coba lagi."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      "Lupa Password",
      "Masukkan email Anda untuk reset password:",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Kirim",
          onPress: async (email) => {
            if (email && /\S+@\S+\.\S+/.test(email)) {
              await sendResetPasswordEmail(email);
            } else {
              Alert.alert("Error", "Masukkan email yang valid!");
            }
          }
        }
      ],
      "plain-text",
      "",
      "email-address"
    );
  };

  const sendResetPasswordEmail = async (email) => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${BASE_URL}/pengguna/forgot-password`,
        { email },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.code === 200) {
        Alert.alert(
          "Success", 
          "Link reset password telah dikirim ke email Anda!"
        );
      } else {
        Alert.alert("Error", response.data.message || "Gagal mengirim email reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      
      if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Gagal mengirim email reset password. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2691B5", "#3640c2ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Silakan masukkan username dan kata sandi Anda!
          </Text>

          {/* General Error Message */}
          {errors.general ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username/Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.username && styles.inputError
              ]}
              placeholder="username atau email"
              placeholderTextColor="#7b8ba5ff"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) clearErrors();
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.username ? (
              <Text style={styles.fieldErrorText}>{errors.username}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.passwordContainer,
              errors.password && styles.inputError
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="********"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) clearErrors();
                }}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.fieldErrorText}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.rememberMeContainer}>
            <BouncyCheckbox
              size={20}
              fillColor="#2691B5"
              unfillColor="#FFFFFF"
              iconStyle={{ borderColor: "#2691B5" }}
              innerIconStyle={{ borderWidth: 2 }}
              isChecked={rememberMe}
              onPress={(isChecked) => setRememberMe(isChecked)}
              text="Remember me"
              textStyle={styles.rememberMeText}
            />
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 25,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#2691B5",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
  },
  eyeIcon: {
    padding: 8,
    marginRight: 8,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rememberMeText: {
    color: "#374151",
    textDecorationLine: "none",
    fontSize: 14,
  },
  forgotText: {
    color: "#2691B5",
    fontWeight: "500",
    textAlign: "right",
    marginTop: 5,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#2691B5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    elevation: 2,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
  loginText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  fieldErrorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});