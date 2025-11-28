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
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";

export default function EditTagihanScreen({ navigation, route }) {
  const { tagihan } = route.params;
  
  const [namaTagihan, setNamaTagihan] = useState(tagihan.namaTagihan || "");
  const [nominalTagihan, setNominalTagihan] = useState(
    tagihan.nominal ? tagihan.nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
  );
  const [tanggalPelunasan, setTanggalPelunasan] = useState(tagihan.tanggalJatuhTempo || "");
  const [catatan, setCatatan] = useState(tagihan.catatan || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isBerkala, setIsBerkala] = useState(
    tagihan.tipePerulangan && tagihan.tipePerulangan !== "tidak_berulang"
  );
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setTanggalPelunasan(formattedDate);
    }
  };

  const handleUpdate = async () => {
    if (!namaTagihan || !nominalTagihan || !tanggalPelunasan) {
      Alert.alert("Validasi", "Harap isi semua field wajib!");
      return;
    }

    try {
      setLoading(true);
      const tipePerulangan = isBerkala ? "bulanan" : "tidak_berulang";

      const payload = {
        idTagihan: tagihan.idTagihan,
        pengguna: tagihan.pengguna,
        namaTagihan: namaTagihan.trim(),
        nominal: parseFloat(nominalTagihan.replace(/\./g, "")),
        tanggalJatuhTempo: tanggalPelunasan,
        tipePerulangan: tipePerulangan,
        terakhirDikirim: tagihan.terakhirDikirim,
        status: tagihan.status,
        catatan: catatan.trim(),
      };

      console.log("Payload update:", payload);

      const response = await axios.put(
        `${BASE_URL}/tagihan`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        Alert.alert("Sukses ✅", "Tagihan berhasil diperbarui!", [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert("Gagal ❌", "Terjadi kesalahan saat memperbarui tagihan.");
      }
    } catch (error) {
      console.error("❌ Error saat update tagihan:", error);
      Alert.alert("Koneksi Gagal", "Tidak dapat terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Batal Edit",
      "Perubahan tidak akan disimpan. Lanjutkan?",
      [
        { text: "Tidak", style: "cancel" },
        { text: "Ya", onPress: () => navigation.goBack() }
      ]
    );
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2691B5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Tagihan</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#2691B5" />
          <Text style={styles.infoText}>
            Perbarui informasi tagihan Anda
          </Text>
        </View>

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
              value={tanggalPelunasan ? new Date(tanggalPelunasan) : new Date()}
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

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <Text style={styles.label}>Status Saat Ini:</Text>
            <View style={[
              styles.statusBadgeLarge,
              { backgroundColor: tagihan.status === "Lunas" ? "#00B050" : "#B71C1C" }
            ]}>
              <Text style={styles.statusBadgeText}>{tagihan.status}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.updateButton, 
              loading && styles.updateButtonDisabled
            ]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.updateButtonText}>Simpan Perubahan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2691B5",
    fontFamily: "Poppins",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2691B5",
  },
  infoText: {
    fontSize: 14,
    color: "#2691B5",
    marginLeft: 10,
    flex: 1,
    fontFamily: "Poppins",
  },
  formBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(38, 145, 181, 0.2)",
    shadowColor: "#2691B5",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    color: "#2691B5",
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    fontFamily: "Poppins",
  },
  input: {
    backgroundColor: "#F0F9FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2691B5",
    padding: 12,
    fontSize: 14,
    color: "#1E3A8A",
    fontFamily: "Poppins",
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
    fontFamily: "Poppins",
  },
  statusContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  statusBadgeLarge: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#2691B5",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A6A8F",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  updateButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Poppins",
  },
});