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
  const [catatan, setCatatan] = useState(""); // ✅ field baru
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
      const statusTagihan = "aktif";

      // ✅ Tambahkan catatan ke payload
      const payload = {
        pengguna: { idPengguna: 1 },
        namaTagihan: namaTagihan.trim(),
        nominal: parseInt(nominalTagihan.replace(/\./g, ""), 10), // kirim 200000
        tanggalJatuhTempo: tanggalPelunasan,
        tipePerulangan: tipePerulangan,
        terakhirDikirim: new Date().toISOString(),
        status: statusTagihan,
        catatan: catatan.trim(), // ✅
      };

      const response = await axios.post(
        "http://10.1.5.173:8080/api/tagihan",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sukses ✅", "Tagihan berhasil disimpan!");
        setNamaTagihan("");
        setNominalTagihan("");
        setTanggalPelunasan("");
        setCatatan(""); // ✅ reset setelah simpan
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
      colors={["#3B82F6", "#1E3A8A"]}
      style={styles.gradientBackground}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tambah Tagihan</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form Input */}
        <View style={styles.formBox}>
          <Text style={styles.label}>Nama Tagihan *</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan Nama Tagihan"
            placeholderTextColor="#C4B5FD"
            value={namaTagihan}
            onChangeText={setNamaTagihan}
          />

          <Text style={styles.label}>Nominal Tagihan *</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan Nominal Tagihan"
            placeholderTextColor="#C4B5FD"
            value={nominalTagihan}
            onChangeText={(text) => {
              // Hapus semua karakter non-angka
              const numericValue = text.replace(/\D/g, "");

              // Format angka dengan titik pemisah ribuan
              const formattedValue = numericValue.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                "."
              );

              setNominalTagihan(formattedValue);
            }}
            keyboardType="numeric"
          />

          {/* ✅ Field Catatan */}
          <Text style={styles.label}>Catatan</Text>
          <TextInput
            value={catatan}
            onChangeText={setCatatan}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Tulis catatan tambahan (opsional)"
            placeholderTextColor="#C4B5FD"
            multiline
          />

          <Text style={styles.label}>Tanggal Jatuh Tempo *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={{
                color: tanggalPelunasan ? "#4C1D95" : "#A78BFA",
                flex: 1,
              }}
            >
              {tanggalPelunasan
                ? tanggalPelunasan
                : "Tentukan tanggal jatuh tempo"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#7C3AED" />
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
              trackColor={{ false: "#C084FC", true: "#A855F7" }}
              thumbColor="#fff"
            />
            <Text style={styles.keteranganText}>Tagihan Berkala?</Text>
          </View>
        </View>

        {/* Tombol Simpan */}
        <LinearGradient
          colors={["#A855F7", "#7E22CE"]}
          style={styles.saveButton}
        >
          <TouchableOpacity onPress={handleSave} style={{ width: "100%" }}>
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </LinearGradient>
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
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  formBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#A855F7",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    color: "#4C1D95",
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#EDE9FE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C4B5FD",
    padding: 10,
    fontSize: 14,
    color: "#4C1D95",
  },
  dateInput: {
    backgroundColor: "#EDE9FE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C4B5FD",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  keteranganRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  keteranganText: {
    color: "#4C1D95",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  saveButton: {
    marginTop: 25,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#6D28D9",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});
