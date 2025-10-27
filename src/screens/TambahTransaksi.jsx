import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

export default function TambahTransaksiScreen({ navigation }) {
  const [tipe, setTipe] = useState("pengeluaran");
  const [nominal, setNominal] = useState("");
  const [catatan, setCatatan] = useState("");
  const [kategori, setKategori] = useState(null);
  const idPengguna = 1;
  const idAkun = 1;

  const kategoriList = {
    pengeluaran: [
      { id_kategori: 3, nama_kategori: "Fashion" },
      { id_kategori: 4, nama_kategori: "Pendidikan" },
      { id_kategori: 5, nama_kategori: "Pulsa" },
      { id_kategori: 6, nama_kategori: "Air" },
      { id_kategori: 7, nama_kategori: "Listrik" },
      { id_kategori: 8, nama_kategori: "Pajak" },
      { id_kategori: 10, nama_kategori: "Makanan" },
      { id_kategori: 11, nama_kategori: "Transportasi" },
      { id_kategori: 12, nama_kategori: "Belanja" },
    ],
    pemasukan: [
      { id_kategori: 1, nama_kategori: "Deposit" },
      { id_kategori: 2, nama_kategori: "Investasi" },
      { id_kategori: 9, nama_kategori: "Gaji" },
    ],
  };

  // ✅ Simpan transaksi
  const simpanTransaksi = async () => {
    if (!nominal || !kategori) {
      Alert.alert("Lengkapi Data", "Nominal dan kategori wajib diisi");
      return;
    }

    const data = {
      pengguna: { idPengguna },
      akun: { idAkun },
      tipeTransaksi: tipe,
      kategori: { idKategori: kategori.id_kategori }, // ✅ Kirim ID kategori (FK)
      nominal: parseFloat(nominal.replace(/\./g, "")),
      tanggalTransaksi: new Date().toISOString(),
      catatan,
    };

    try {
      const res = await axios.post(
        "http://10.1.5.173:8080/api/transaksi-keuangan",
        data
      );
      Alert.alert("Berhasil", "Transaksi berhasil disimpan!");
      setNominal("");
      setCatatan("");
      setKategori(null);
    } catch (err) {
      console.error("Terjadi kesalahan:", err.response?.data || err.message);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan transaksi");
    }
  };

  const getIconName = (item) => {
    switch (item.nama_kategori) {
      case "Makanan":
        return "food";
      case "Transportasi":
        return "bus";
      case "Belanja":
        return "cart";
      case "Fashion":
        return "tshirt-crew";
      case "Pendidikan":
        return "school";
      case "Pulsa":
        return "cellphone";
      case "Air":
        return "water";
      case "Listrik":
        return "flash";
      case "Pajak":
        return "file-document";
      case "Gaji":
        return "cash";
      case "Investasi":
        return "chart-line";
      case "Deposit":
        return "bank";
      default:
        return "wallet-outline";
    }
  };

  return (
    <LinearGradient
      colors={["#3B82F6", "#1E3A8A"]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[
              styles.switchButton,
              tipe === "pemasukan" && styles.activeIncome,
            ]}
            onPress={() => setTipe("pemasukan")}
          >
            <Text
              style={[
                styles.switchText,
                tipe === "pemasukan" && styles.activeText,
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchButton,
              tipe === "pengeluaran" && styles.activeExpense,
            ]}
            onPress={() => setTipe("pengeluaran")}
          >
            <Text
              style={[
                styles.switchText,
                tipe === "pengeluaran" && styles.activeText,
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kategoriContainer}>
          {kategoriList[tipe].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.kategoriButton,
                kategori?.id_kategori === item.id_kategori &&
                  styles.kategoriButtonActive,
              ]}
              onPress={() => setKategori(item)}
            >
              <MaterialCommunityIcons
                name={getIconName(item)}
                size={24}
                color={
                  kategori?.id_kategori === item.id_kategori
                    ? "#fff"
                    : "#ffffffff"
                }
              />
              <Text
                style={[
                  styles.kategoriText,
                  kategori?.id_kategori === item.id_kategori && {
                    color: "#fff",
                  },
                ]}
              >
                {item.nama_kategori}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nominal (Rp)</Text>
          <TextInput
            keyboardType="numeric"
            value={nominal}
            onChangeText={(text) => {
              const cleanValue = text.replace(/\D/g, "");
              const formattedValue = cleanValue.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                "."
              );
              setNominal(formattedValue);
            }}
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#ddd"
          />

          <Text style={styles.label}>Catatan</Text>
          <TextInput
            value={catatan}
            onChangeText={setCatatan}
            style={styles.input}
            placeholder="Opsional"
            placeholderTextColor="#ddd"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={simpanTransaksi}>
          <LinearGradient
            colors={["#9333EA", "#7E22CE"]}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { padding: 16, paddingBottom: 50 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  switchButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 5,
  },
  activeIncome: { backgroundColor: "#9333EA" },
  activeExpense: { backgroundColor: "#7E22CE" },
  switchText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  activeText: { color: "#fff" },
  kategoriContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  kategoriButton: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 16,
    padding: 10,
    margin: 5,
    alignItems: "center",
    flexBasis: "28%",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  kategoriButtonActive: { backgroundColor: "#9333EA" },
  kategoriText: { fontSize: 8, marginTop: 4, color: "#fff" },
  formContainer: { marginVertical: 20 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    color: "#fff",
  },
  saveButton: { borderRadius: 12, overflow: "hidden", marginTop: 10 },
  saveButtonGradient: { paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
