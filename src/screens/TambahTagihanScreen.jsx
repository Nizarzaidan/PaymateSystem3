import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

export default function TambahTagihanScreen({ navigation }) {
  const [namaTagihan, setNamaTagihan] = useState("");
  const [nominalTagihan, setNominalTagihan] = useState("");
  const [tanggalPelunasan, setTanggalPelunasan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isBerkala, setIsBerkala] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setTanggalPelunasan(formattedDate);
    }
  };

  const handleSave = async () => {
    if (!namaTagihan || !nominalTagihan || !tanggalPelunasan) {
      Alert.alert("Validasi", "Harap isi semua field wajib!");
      return;
    }

    try {
      const tipePerulangan = isBerkala ? "bulanan" : "tidak_berulang";
      const statusTagihan = "Belum Lunas"; // Default status

      const payload = {
        pengguna: { idPengguna: 1 },
        namaTagihan: namaTagihan.trim(),
        nominal: parseFloat(nominalTagihan.replace(/\./g, "")),
        tanggalJatuhTempo: tanggalPelunasan,
        tipePerulangan: tipePerulangan,
        terakhirDikirim: new Date().toISOString(),
        status: statusTagihan,
        catatan: catatan.trim(),
      };

      const response = await axios.post(
        "http://10.66.58.196:8080/api/tagihan",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

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
    }
  };

  return (
    <LinearGradient
      colors={["#ffffffff", "#ffffffff"]}
      style={styles.gradientBackground}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

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
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Simpan Tagihan</Text>
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
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});