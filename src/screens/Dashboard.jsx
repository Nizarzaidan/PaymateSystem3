import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const navigation = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState("Oktober");
  const [selectedYear, setSelectedYear] = useState("2025");

  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [pemasukan, setPemasukan] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  const API_URL = "http://10.1.5.173:8080/api/transaksi-keuangan/pengguna";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const idPengguna = 1;

      const response = await axios.get(
        `${API_URL}/${idPengguna}/laporan/rekap`
      );
      console.log("📦 Data dari backend:", response.data);

      if (!response.data || response.data.length === 0) {
        Alert.alert("Info", "Belum ada data rekap untuk pengguna ini.");
        setSaldo(0);
        setPemasukan(0);
        setPengeluaran(0);
        return;
      }

      const data = response.data[0];
      const totalPemasukan = data.totalPemasukan || 0;
      const totalPengeluaran = data.totalPengeluaran || 0;
      const totalSaldo = totalPemasukan - totalPengeluaran;

      setPemasukan(totalPemasukan);
      setPengeluaran(totalPengeluaran);
      setSaldo(totalSaldo);
    } catch (error) {
      console.error("❌ Gagal memuat data dashboard:", error);
      Alert.alert(
        "Error",
        `Gagal memuat data: ${
          error.response?.status === 404
            ? "Data tidak ditemukan (404)"
            : error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value) => {
    if (isNaN(value)) return "Rp 0";
    return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        data: [500000, 700000, 600000, 900000, 800000, 1000000],
        color: () => "#2563EB",
      },
      {
        data: [400000, 300000, 500000, 400000, 600000, 700000],
        color: () => "#3B82F6",
      },
    ],
    legend: ["Pemasukan", "Pengeluaran"],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#3B82F6", "#1E3A8A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <View style={styles.balanceTop}>
                <Text style={styles.balanceLabel}>Total Saldo</Text>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                  <Ionicons
                    name={showBalance ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.balanceAmount}>
                {showBalance ? formatRupiah(saldo) : "*******"}
              </Text>

              <View style={styles.balanceBottom}>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceSubLabel}>Pemasukan</Text>
                  <Text style={styles.income}>
                    {showBalance ? `+${formatRupiah(pemasukan)}` : "*******"}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceSubLabel}>Pengeluaran</Text>
                  <Text style={styles.expense}>
                    {showBalance ? `-${formatRupiah(pengeluaran)}` : "*******"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </LinearGradient>
      </View>

      {/* ISI UTAMA */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 20 }} />

        {/* MENU CEPAT */}
        <View style={styles.quickMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TambahTransaksi")}
          >
            <Ionicons name="add-circle" size={30} color="#2563EB" />
            <Text style={styles.menuText}>Tambah</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TabunganScreen")}
          >
            <MaterialIcons name="savings" size={30} color="#0284C7" />
            <Text style={styles.menuText}>Tabungan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TambahTagihanScreen")}
          >
            <Ionicons name="card" size={30} color="#0EA5E9" />
            <Text style={styles.menuText}>+ Tagihan</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER */}
        <View style={styles.filterBox}>
          <View style={styles.pickerBox}>
            <Text style={styles.filterLabel}>Bulan</Text>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={setSelectedMonth}
            >
              {[
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ].map((month) => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerBox}>
            <Text style={styles.filterLabel}>Tahun</Text>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={setSelectedYear}
            >
              {["2023", "2024", "2025"].map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        {/* GRAFIK */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Grafik Keuangan {selectedMonth} {selectedYear}
          </Text>

          {chartData && chartData.datasets ? (
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                propsForDots: { r: "4", strokeWidth: "1", stroke: "#2563EB" },
              }}
              bezier
              style={styles.chartStyle}
            />
          ) : (
            <Text style={{ color: "#9CA3AF" }}>Belum ada data grafik</Text>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.active]}>
          <Ionicons name="home" size={26} color="#2563EB" />
          <Text style={[styles.navText, styles.activeText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("RiwayatScreen")}
        >
          <Ionicons name="time" size={26} color="#9CA3AF" />
          <Text style={styles.navText}>Riwayat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("LihatTabunganScreen")}
        >
          <MaterialIcons name="savings" size={26} color="#64748B" />
          <Text style={styles.navText}>Tabungan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TagihanScreen")}
        >
          <MaterialIcons name="receipt-long" size={26} color="#9CA3AF" />
          <Text style={styles.navText}>Tagihan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={26} color="#9CA3AF" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#f6f6f6ff",
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  balanceLabel: { color: "#DBEAFE", fontSize: 14 },
  balanceAmount: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 10,
  },
  balanceBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfo: { alignItems: "center", flex: 1 },
  divider: { width: 1, backgroundColor: "rgba(255,255,255,0.4)", height: 30 },
  balanceSubLabel: { color: "#EFF6FF", fontSize: 13 },
  income: { color: "#BBF7D0", fontSize: 15, fontWeight: "600" },
  expense: { color: "#FCA5A5", fontSize: 15, fontWeight: "600" },
  scrollView: { paddingHorizontal: 15 },
  quickMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 18,
    marginBottom: 20,
    elevation: 5,
  },
  menuItem: { alignItems: "center" },
  menuText: { fontSize: 13, marginTop: 5, color: "#374151", fontWeight: "500" },
  filterBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  pickerBox: { flex: 1, marginHorizontal: 5 },
  filterLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  picker: { height: 40 },
  chartContainer: { alignItems: "center", marginBottom: 100 },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 10,
  },
  chartStyle: { borderRadius: 16 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    elevation: 10,
  },
  navItem: { flex: 1, alignItems: "center" },
  navText: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  activeText: { color: "#2563EB", fontWeight: "600" },
});
