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
import axios from "axios";

export default function TambahTransaksiScreen({ navigation }) {
  const [tipe, setTipe] = useState("pengeluaran");
  const [nominal, setNominal] = useState("");
  const [catatan, setCatatan] = useState("");
  const [kategori, setKategori] = useState(null);
  const idPengguna = 1;
  const idAkun = 1;

  // Pastikan mapping ID sesuai dengan database
  const kategoriList = {
    pengeluaran: [
      { id: 1, nama: "Makanan" },
      { id: 2, nama: "Transportasi" },
      { id: 3, nama: "Belanja" },
      { id: 4, nama: "Fashion" },
      { id: 5, nama: "Pendidikan" },
      { id: 6, nama: "Pulsa" },
      { id: 7, nama: "Air" },
      { id: 8, nama: "Listrik" },
      { id: 9, nama: "Pajak" },
    ],
    pemasukan: [
      { id: 10, nama: "Gaji" },
      { id: 11, nama: "Investasi" },
      { id: 12, nama: "Deposit" },
    ],
  };

  // Fungsi untuk format nominal dengan separator
  const formatNominal = (value) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (numericValue) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return "";
  };

  // Fungsi untuk konversi dari format display ke angka murni
  const parseNominal = (formattedValue) => {
    return formattedValue.replace(/\./g, "");
  };

  const handleNominalChange = (text) => {
    const formatted = formatNominal(text);
    setNominal(formatted);
  };

  const simpanTransaksi = async () => {
    if (!nominal || !kategori) {
      Alert.alert("Lengkapi Data", "Nominal dan kategori wajib diisi");
      return;
    }

    // Konversi nominal dari format display ke angka murni
    const nominalNumber = parseNominal(nominal);

    const data = {
      pengguna: { idPengguna },
      akun: { idAkun },
      tipeTransaksi: tipe,
      kategori: { idKategori: kategori.id }, // Gunakan ID dari objek kategori
      nominal: parseFloat(nominalNumber),
      tanggalTransaksi: new Date().toISOString(),
      catatan,
    };

    console.log("📤 Data yang dikirim:", data);

    try {
      const res = await axios.post(
        "http://10.66.58.196:8080/api/transaksi-keuangan",
        data
      );
      Alert.alert("Berhasil", "Transaksi berhasil disimpan!");
      setNominal("");
      setCatatan("");
      setKategori(null);
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan transaksi: " + 
        (err.response?.data?.message || err.message));
    }
  };

  const getIconName = (namaKategori) => {
    switch (namaKategori) {
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

  // Reset kategori saat tipe transaksi berubah
  const handleTipeChange = (newTipe) => {
    setTipe(newTipe);
    setKategori(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            tipe === "pemasukan" && styles.activeIncome,
          ]}
          onPress={() => handleTipeChange("pemasukan")}
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
          onPress={() => handleTipeChange("pengeluaran")}
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
        {kategoriList[tipe].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.kategoriButton,
              kategori?.id === item.id && styles.kategoriButtonActive,
            ]}
            onPress={() => setKategori(item)}
          >
            <MaterialCommunityIcons
              name={getIconName(item.nama)}
              size={24}
              color={kategori?.id === item.id ? "#fff" : "#2691B5"}
            />
            <Text
              style={[
                styles.kategoriText,
                kategori?.id === item.id && { color: "#fff" },
              ]}
            >
              {item.nama}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          keyboardType="numeric"
          value={nominal}
          onChangeText={handleNominalChange}
          style={styles.input}
          placeholder="0"
        />
        {nominal ? (
          <Text style={styles.nominalPreview}>
            Rp {nominal}
          </Text>
        ) : null}

        <Text style={styles.label}>Catatan</Text>
        <TextInput
          value={catatan}
          onChangeText={setCatatan}
          style={styles.input}
          placeholder="Opsional"
        />

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Kategori terpilih: {kategori ? `${kategori.nama} (ID: ${kategori.id})` : 'Belum dipilih'}
          </Text>
          <Text style={styles.debugText}>
            Tipe: {tipe}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={simpanTransaksi}>
        <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  switchButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 5,
  },
  activeIncome: { backgroundColor: "#2691B5" },
  activeExpense: { backgroundColor: "#ef4444" },
  switchText: { fontSize: 16, fontWeight: "600", color: "#555" },
  activeText: { color: "#fff" },
  kategoriContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  kategoriButton: {
    borderWidth: 1,
    borderColor: "#2691B5",
    borderRadius: 16,
    padding: 10,
    margin: 5,
    alignItems: "center",
    flexBasis: "28%",
  },
  kategoriButtonActive: { backgroundColor: "#2691B5" },
  kategoriText: { fontSize: 13, marginTop: 4, color: "#2691B5" },
  formContainer: { marginVertical: 20 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
  },
  nominalPreview: {
    fontSize: 16,
    color: "#2691B5",
    marginBottom: 15,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2691B5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  debugContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#6b7280",
  },
});