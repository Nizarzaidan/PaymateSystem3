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
import axios from "axios";

export default function TambahTagihanScreen({ navigation }) {
  const [namaTagihan, setNamaTagihan] = useState("");
  const [nominalTagihan, setNominalTagihan] = useState("");
  const [tanggalPelunasan, setTanggalPelunasan] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isBerkala, setIsBerkala] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // yyyy-mm-dd
      setTanggalPelunasan(formattedDate);
    }
  };

  const handleSave = async () => {
    if (!namaTagihan || !nominalTagihan || !tanggalPelunasan) {
      Alert.alert("Validasi", "Harap isi semua field wajib!");
      return;
    }

    try {
      // ✅ Sesuaikan dengan CHECK constraint DB
      const tipePerulangan = isBerkala ? "bulanan" : "tidak_berulang";
      const statusTagihan = "aktif";

      const payload = {
        pengguna: { idPengguna: 1 }, // sesuaikan ID pengguna dengan DB kamu
        namaTagihan: namaTagihan.trim(),
        nominal: parseFloat(nominalTagihan),
        tanggalJatuhTempo: tanggalPelunasan,
        tipePerulangan: tipePerulangan,
        terakhirDikirim: new Date().toISOString(),
        status: statusTagihan,
      };

      console.log("📦 Data dikirim ke backend:", payload);

      const response = await axios.post(
        "http://10.1.5.173:8080/api/tagihan",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sukses ✅", "Tagihan berhasil disimpan!");
        navigation.goBack();
      } else {
        Alert.alert("Gagal ❌", "Terjadi kesalahan saat menyimpan tagihan.");
      }
    } catch (error) {
      console.error("❌ Error saat simpan tagihan:", error);
      if (error.response) {
        Alert.alert(
          "Error Server",
          `Status: ${error.response.status}\n${
            error.response.data?.message || "Terjadi kesalahan pada server."
          }`
        );
      } else {
        Alert.alert(
          "Koneksi Gagal",
          "Tidak dapat terhubung ke server backend."
        );
      }
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        ></TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Tagihan</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form Input */}
      <View style={styles.formBox}>
        <Text style={styles.label}>Nama Tagihan *</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan Nama Tagihan"
          value={namaTagihan}
          onChangeText={setNamaTagihan}
        />

        <Text style={styles.label}>Nominal Tagihan *</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan Nominal Tagihan"
          value={nominalTagihan}
          onChangeText={setNominalTagihan}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Tanggal Jatuh Tempo *</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={{
              color: tanggalPelunasan ? "#111827" : "#9CA3AF",
              flex: 1,
            }}
          >
            {tanggalPelunasan
              ? tanggalPelunasan
              : "Tentukan tanggal jatuh tempo"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
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
            trackColor={{ false: "#CBD5E1", true: "#3B82F6" }}
            thumbColor={isBerkala ? "#fff" : "#f4f3f4"}
          />
          <Text style={styles.keteranganText}>Tagihan Berkala?</Text>
        </View>
      </View>

      {/* Tombol Simpan */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Simpan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  formBox: {
    backgroundColor: "#E0F2FE",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  label: {
    color: "#1E3A8A",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 10,
    fontSize: 14,
    color: "#111827",
  },
  dateInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
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
    color: "#1E293B",
    fontSize: 14,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
