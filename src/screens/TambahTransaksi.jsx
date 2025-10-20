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

  const kategoriList = {
    pengeluaran: [
      "Makanan",
      "Transportasi",
      "Belanja",
      "Fashion",
      "Pendidikan",
      "Pulsa",
      "Air",
      "Listrik",
      "Pajak",
    ],
    pemasukan: ["Gaji", "Investasi", "Deposit"],
  };

  const simpanTransaksi = async () => {
    if (!nominal || !kategori) {
      Alert.alert("Lengkapi Data", "Nominal dan kategori wajib diisi");
      return;
    }

    const data = {
      pengguna: { idPengguna },
      akun: { idAkun },
      tipeTransaksi: tipe,
      kategori: { idKategori: 1 },
      nominal: parseFloat(nominal),
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
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan transaksi");
    }
  };

  const getIconName = (item) => {
    switch (item) {
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
    <ScrollView style={styles.container}>
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
              kategori === item && styles.kategoriButtonActive,
            ]}
            onPress={() => setKategori(item)}
          >
            <MaterialCommunityIcons
              name={getIconName(item)}
              size={24}
              color={kategori === item ? "#fff" : "#3b82f6"}
            />
            <Text
              style={[
                styles.kategoriText,
                kategori === item && { color: "#fff" },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          keyboardType="numeric"
          value={nominal}
          onChangeText={setNominal}
          style={styles.input}
          placeholder="0"
        />

        <Text style={styles.label}>Catatan</Text>
        <TextInput
          value={catatan}
          onChangeText={setCatatan}
          style={styles.input}
          placeholder="Opsional"
        />
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
  activeIncome: { backgroundColor: "#3b82f6" },
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
    borderColor: "#3b82f6",
    borderRadius: 16,
    padding: 10,
    margin: 5,
    alignItems: "center",
    flexBasis: "28%",
  },
  kategoriButtonActive: { backgroundColor: "#3b82f6" },
  kategoriText: { fontSize: 13, marginTop: 4, color: "#3b82f6" },
  formContainer: { marginVertical: 20 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
