import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/apiClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
<<<<<<< HEAD:src/screens/TambahTagihanScreen.jsx
=======
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tagihan/TambahTagihanScreen.jsx

export default function TambahTagihanScreen({ navigation }) {
  const [namaTagihan, setNamaTagihan] = useState("");
  const [nominalTagihan, setNominalTagihan] = useState("");
  const [tanggalPelunasan, setTanggalPelunasan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isBerkala, setIsBerkala] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        console.log("👤 User data loaded:", user);
        setUserId(user.idPengguna || user.id);
        setUserData(user);
      } else {
        console.log("❌ No user data found");
        Alert.alert("Error", "Silakan login kembali");
        navigation.goBack();
      }
    } catch (error) {
      console.error("❌ Error getting user data:", error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setTanggalPelunasan(formattedDate);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!namaTagihan || !nominalTagihan || !tanggalPelunasan) {
      Alert.alert("Validasi", "Harap isi semua field wajib!");
      return;
    }

    try {
      setLoading(true);
      const tipePerulangan = isBerkala ? "bulanan" : "tidak_berulang";
      const statusTagihan = "Belum Lunas"; // Default status

      // ✅ Tambahkan catatan ke payload
      const payload = {
        pengguna: { idPengguna: userId },
        namaTagihan: namaTagihan.trim(),
        nominal: parseFloat(nominalTagihan.replace(/\./g, "")),
        tanggalJatuhTempo: tanggalPelunasan,
        tipePerulangan: tipePerulangan,
        terakhirDikirim: new Date().toISOString(),
        status: statusTagihan,
        catatan: catatan.trim(),
      };

<<<<<<< HEAD:src/screens/TambahTagihanScreen.jsx
      const response = await api.post("/tagihan", payload, {
        headers: { "Content-Type": "application/json" },
      });
=======
      const response = await axios.post(
        `${BASE_URL}/tagihan`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tagihan/TambahTagihanScreen.jsx

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sukses ✅", "Tagihan berhasil disimpan!");
        setNamaTagihan("");
        setNominalTagihan("");
        setTanggalPelunasan("");
        setCatatan("");
        setIsBerkala(false);
        navigation.goBack();
      } else {
        Alert.alert("Gagal ❌", "Terjadi kesalahan saat menyimpan tagihan.");
      }
    } catch (error) {
      console.error("❌ Error saat simpan tagihan:", error);
      Alert.alert("Koneksi Gagal", "Tidak dapat terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Memuat data pengguna...
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#ffffffff", "#ffffffff"]}
      style={styles.gradientBackground}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
<<<<<<< HEAD:src/screens/TambahTagihanScreen.jsx
=======


>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tagihan/TambahTagihanScreen.jsx
        {/* Form Input */}
        <View style={styles.formBox}>
          <Text style={styles.label}>Nama Tagihan *</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan Nama Tagihan"
            placeholderTextColor="#93C5FD"
            value={namaTagihan}
            onChangeText={setNamaTagihan}
          />

          <Text style={styles.label}>Nominal Tagihan *</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan Nominal Tagihan"
            placeholderTextColor="#93C5FD"
            value={nominalTagihan}
            onChangeText={(text) => {
              const numericValue = text.replace(/\D/g, "");
              const formattedValue = numericValue.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                "."
              );
              setNominalTagihan(formattedValue);
            }}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Catatan</Text>
          <TextInput
            value={catatan}
            onChangeText={setCatatan}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Tulis catatan tambahan (opsional)"
            placeholderTextColor="#93C5FD"
            multiline
          />

          <Text style={styles.label}>Tanggal Jatuh Tempo *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={{
                color: tanggalPelunasan ? "#1E3A8A" : "#93C5FD",
                flex: 1,
              }}
            >
              {tanggalPelunasan
                ? tanggalPelunasan
                : "Tentukan tanggal jatuh tempo"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#2691B5" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <View style={styles.keteranganRow}>
            <Switch
              value={isBerkala}
              onValueChange={setIsBerkala}
              trackColor={{ false: "#C4B5FD", true: "#2691B5" }}
              thumbColor="#fff"
            />
            <Text style={styles.keteranganText}>Tagihan Berkala?</Text>
          </View>
        </View>

        {/* Tombol Simpan */}
<<<<<<< HEAD:src/screens/TambahTagihanScreen.jsx
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan Tagihan</Text>
=======
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            loading && styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Tagihan</Text>
          )}
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tagihan/TambahTagihanScreen.jsx
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  userInfo: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2691B5",
  },
  userInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2691B5",
  },
  userIdText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  formBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#2691B5",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    color: "#2691B5",
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#F0F9FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2691B5",
    padding: 12,
    fontSize: 14,
    color: "#1E3A8A",
  },
  dateInput: {
    backgroundColor: "#F0F9FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2691B5",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  keteranganRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  keteranganText: {
    color: "#2691B5",
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2691B5",
    marginTop: 25,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#1A6A8F",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});
