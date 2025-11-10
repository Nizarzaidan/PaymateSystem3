import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";

export default function TambahTransaksiScreen({ navigation }) {
  const [tipe, setTipe] = useState("pengeluaran");
  const [nominal, setNominal] = useState("");
  const [catatan, setCatatan] = useState("");
  const [kategori, setKategori] = useState(null);
  const [kategoriList, setKategoriList] = useState({
    pengeluaran: [],
    pemasukan: []
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadKategori();
    }
  }, [userId]);

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

  const loadKategori = async () => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      console.log("🔄 Memuat data kategori untuk user:", userId);
      const response = await axios.get(`${BASE_URL}/kategori-transaksi/pengguna/${userId}`);
      console.log("📦 Data kategori diterima:", response.data.length, "items");
      
      const activeKategori = response.data.filter(k => k.status !== false);
      
      const grouped = {
        pengeluaran: activeKategori.filter(k => k.tipeKategori === 'pengeluaran'),
        pemasukan: activeKategori.filter(k => k.tipeKategori === 'pemasukan')
      };
      
      setKategoriList(grouped);
    } catch (error) {
      console.error("❌ Gagal memuat kategori:", error);
      Alert.alert("Error", "Gagal memuat data kategori");
    }
  };

  const formatNominal = (value) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (numericValue) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return "";
  };

  const parseNominal = (formattedValue) => {
    return formattedValue.replace(/\./g, "");
  };

  const handleNominalChange = (text) => {
    const formatted = formatNominal(text);
    setNominal(formatted);
  };

  const simpanTransaksi = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!nominal || !kategori) {
      Alert.alert("Lengkapi Data", "Nominal dan kategori wajib diisi");
      return;
    }

    const nominalNumber = parseNominal(nominal);

    if (parseFloat(nominalNumber) <= 0) {
      Alert.alert("Error", "Nominal harus lebih dari 0");
      return;
    }

    const idAkun = userData?.idAkun || 1;

    const data = {
      pengguna: { idPengguna: userId },
      akun: { idAkun },
      tipeTransaksi: tipe,
      kategori: { idKategori: kategori.idKategori },
      nominal: parseFloat(nominalNumber),
      tanggalTransaksi: new Date().toISOString(),
      catatan: catatan || "-",
    };

    console.log("📤 Data yang dikirim:", data);

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/transaksi-keuangan`,
        data
      );
      console.log("✅ Response:", res.data);
      
      Alert.alert("Berhasil", "Transaksi berhasil disimpan!", [
        { 
          text: "OK", 
          onPress: () => {
            setNominal("");
            setCatatan("");
            setKategori(null);
            loadKategori();
            navigation.goBack();
          }
        }
      ]);
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan transaksi: " + 
        (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (kategoriItem) => {
    if (kategoriItem && kategoriItem.ikon) {
      return kategoriItem.ikon;
    }
    
    const namaKategori = kategoriItem.namaKategori;
    switch (namaKategori) {
      case "Makanan": return "food";
      case "Transportasi": return "bus";
      case "Belanja": return "cart";
      case "Fashion": return "tshirt-crew";
      case "Pendidikan": return "school";
      case "Pulsa": return "cellphone";
      case "Air": return "water";
      case "Listrik": return "flash";
      case "Pajak": return "file-document";
      case "Gaji": return "cash";
      case "Investasi": return "chart-line";
      case "Deposit": return "bank";
      default: return "wallet-outline";
    }
  };

  const handleTipeChange = (newTipe) => {
    setTipe(newTipe);
    setKategori(null);
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
        {kategoriList[tipe] && kategoriList[tipe].length > 0 ? (
          kategoriList[tipe].map((item) => (
            <TouchableOpacity
              key={item.idKategori}
              style={[
                styles.kategoriButton,
                kategori?.idKategori === item.idKategori && styles.kategoriButtonActive,
                { borderColor: item.warna || "#2691B5" }
              ]}
              onPress={() => setKategori(item)}
            >
              <MaterialCommunityIcons
                name={getIconName(item)}
                size={24}
                color={kategori?.idKategori === item.idKategori ? "#fff" : (item.warna || "#2691B5")}
              />
              <Text
                style={[
                  styles.kategoriText,
                  kategori?.idKategori === item.idKategori && { color: "#fff" },
                ]}
                numberOfLines={1}
              >
                {item.namaKategori}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyKategori}>
            <Text style={styles.emptyKategoriText}>
              Tidak ada kategori {tipe}. Silakan tambah kategori terlebih dahulu.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          keyboardType="numeric"
          value={nominal}
          onChangeText={handleNominalChange}
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
        {nominal ? (
          <Text style={styles.nominalPreview}>
            Rp {nominal}
          </Text>
        ) : null}

        <Text style={styles.label}>Catatan (Opsional)</Text>
        <TextInput
          value={catatan}
          onChangeText={setCatatan}
          style={styles.input}
          placeholder="Tambahkan catatan..."
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            User ID: {userId}
          </Text>
          <Text style={styles.debugText}>
            Kategori terpilih: {kategori ? `${kategori.namaKategori} (ID: ${kategori.idKategori})` : 'Belum dipilih'}
          </Text>
          <Text style={styles.debugText}>
            Tipe: {tipe}
          </Text>
          <Text style={styles.debugText}>
            Total Kategori: {kategoriList[tipe]?.length || 0}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.saveButton, 
          (!nominal || !kategori || loading) && styles.saveButtonDisabled
        ]} 
        onPress={simpanTransaksi}
        disabled={!nominal || !kategori || loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 16 
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  switchButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 5,
  },
  activeIncome: { 
    backgroundColor: "#2691B5" 
  },
  activeExpense: { 
    backgroundColor: "#ef4444" 
  },
  switchText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#555" 
  },
  activeText: { 
    color: "#fff" 
  },
  kategoriContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  kategoriButton: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    margin: 5,
    alignItems: "center",
    flexBasis: "28%",
    minHeight: 80,
    justifyContent: "center",
  },
  kategoriButtonActive: { 
    backgroundColor: "#2691B5" 
  },
  kategoriText: { 
    fontSize: 12, 
    marginTop: 6, 
    color: "#2691B5",
    textAlign: "center",
    fontWeight: "500",
  },
  emptyKategori: {
    padding: 20,
    alignItems: "center",
  },
  emptyKategoriText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14,
  },
  formContainer: { 
    marginVertical: 20 
  },
  label: { 
    fontWeight: "bold", 
    marginBottom: 8,
    color: "#374151",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  nominalPreview: {
    fontSize: 16,
    color: "#2691B5",
    marginBottom: 15,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2691B5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  debugContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
});