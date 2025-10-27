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
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [pemasukan, setPemasukan] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [transaksiData, setTransaksiData] = useState([]);

  const API_URL = "http://10.66.58.196:8080/api/transaksi-keuangan/pengguna";

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
      fetchTransaksiForChart();
    }
  }, [selectedDate, isFocused]);

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

  const fetchTransaksiForChart = async () => {
    try {
      const idPengguna = 1;
      const response = await axios.get(
        `${API_URL}/${idPengguna}`
      );
      
      console.log("📊 Data transaksi untuk grafik:", response.data.length, "items");
      setTransaksiData(response.data);
      
      // Process data untuk grafik
      processChartData(response.data);
    } catch (error) {
      console.error("❌ Gagal memuat data transaksi:", error);
    }
  };

  const processChartData = (transaksi) => {
    // Filter transaksi berdasarkan bulan yang dipilih
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    
    const filteredTransaksi = transaksi.filter(item => {
      const transaksiDate = new Date(item.tanggalTransaksi);
      return transaksiDate.getFullYear() === selectedYear && 
             transaksiDate.getMonth() === selectedMonth;
    });

    // Kelompokkan data per minggu dalam bulan tersebut
    const weeklyData = groupDataByWeek(filteredTransaksi, selectedYear, selectedMonth);
    
    // Siapkan data untuk chart
    const labels = weeklyData.map(week => `Minggu ${week.week}`);
    const pemasukanData = weeklyData.map(week => week.pemasukan);
    const pengeluaranData = weeklyData.map(week => week.pengeluaran);

    const chartConfig = {
      labels: labels,
      datasets: [
        {
          data: pemasukanData,
          color: () => "#34D399", // Hijau untuk pemasukan
          strokeWidth: 2,
        },
        {
          data: pengeluaranData,
          color: () => "#EF4444", // Merah untuk pengeluaran
          strokeWidth: 2,
        },
      ],
      legend: ["Pemasukan", "Pengeluaran"],
    };

    setChartData(chartConfig);
  };

  const groupDataByWeek = (transaksi, year, month) => {
    // Buat array untuk 4-5 minggu dalam bulan
    const weeks = [];
    
    // Cari minggu pertama dalam bulan
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let currentWeek = 1;
    let currentDate = new Date(firstDay);
    
    // Inisialisasi data per minggu
    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }
      
      weeks.push({
        week: currentWeek,
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
        pemasukan: 0,
        pengeluaran: 0
      });
      
      currentWeek++;
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Isi data transaksi ke dalam minggu yang sesuai
    transaksi.forEach(transaksi => {
      const transaksiDate = new Date(transaksi.tanggalTransaksi);
      
      for (let week of weeks) {
        if (transaksiDate >= week.startDate && transaksiDate <= week.endDate) {
          if (transaksi.tipeTransaksi === "pemasukan") {
            week.pemasukan += transaksi.nominal || 0;
          } else {
            week.pengeluaran += transaksi.nominal || 0;
          }
          break;
        }
      }
    });

    return weeks;
  };

  const formatRupiah = (value) => {
    if (isNaN(value)) return "Rp 0";
    return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatBalanceDisplay = (value) => {
    if (!showBalance) {
      return "••••••••";
    }
    return formatRupiah(value);
  };

  const formatDate = (date) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const onDateSelect = (day) => {
    const selected = new Date(day.dateString);
    setSelectedDate(selected);
    setShowCalendar(false);
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  // Fungsi untuk mendapatkan data default jika tidak ada data
  const getDefaultChartData = () => {
    return {
      labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
      datasets: [
        {
          data: [0, 0, 0, 0],
          color: () => "#34D399",
          strokeWidth: 2,
        },
        {
          data: [0, 0, 0, 0],
          color: () => "#EF4444",
          strokeWidth: 2,
        },
      ],
      legend: ["Pemasukan", "Pengeluaran"],
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f3eaeaff" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Selamat Datang!</Text>
            <Text style={styles.emailText}>Kelola keuangan dengan mudah</Text>
          </View>
          <Text style={styles.timeText}>{getCurrentTime()}</Text>
        </View>

        <LinearGradient
          colors={["#6FB4CC", "#5F78BA"]}
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
                <TouchableOpacity onPress={toggleBalanceVisibility}>
                  <Ionicons 
                    name={showBalance ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.balanceAmount}>
                {formatBalanceDisplay(saldo)}
              </Text>

              <View style={styles.incomeExpenseContainer}>
                <View style={styles.incomeExpenseItem}>
                  <Text style={styles.incomeExpenseLabel}>Pemasukan</Text>
                  <Text style={styles.incomeAmount}>
                    {formatBalanceDisplay(pemasukan)}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.incomeExpenseItem}>
                  <Text style={styles.incomeExpenseLabel}>Pengeluaran</Text>
                  <Text style={styles.expenseAmount}>
                    {formatBalanceDisplay(pengeluaran)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* MENU CEPAT */}
        <View style={styles.quickMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TambahTransaksi")}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="add-circle" size={28} color="#0EA5E9" />
            </View>
            <Text style={styles.menuText}>Tambah Transaksi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TabunganScreen")}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#F0FDFA' }]}>
              <MaterialIcons name="savings" size={28} color="#14B8A6" />
            </View>
            <Text style={styles.menuText}>Tabungan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TambahTagihanScreen")}
          >
             <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="receipt-outline" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.menuText}>Tagihan</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER TANGGAL */}
        <TouchableOpacity 
          style={styles.dateFilter}
          onPress={() => setShowCalendar(true)}
        >
          <View style={styles.dateFilterLeft}>
            <Ionicons name="calendar" size={20} color="#5F78BA" />
            <Text style={styles.dateFilterText}>{formatDate(selectedDate)}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* GRAFIK */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Grafik Keuangan {formatDate(selectedDate)}
          </Text>

          {chartData ? (
            <LineChart
              data={chartData}
              width={width - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                },
                propsForBackgroundLines: {
                  strokeDasharray: "",
                },
              }}
              bezier
              style={styles.chartStyle}
              fromZero={true}
            />
          ) : (
            <LineChart
              data={getDefaultChartData()}
              width={width - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                },
              }}
              bezier
              style={styles.chartStyle}
              fromZero={true}
            />
          )}

          {/* LEGENDA */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#34D399' }]} />
              <Text style={styles.legendText}>Pemasukan</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Pengeluaran</Text>
            </View>
          </View>

          {/* INFO STATISTIK */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Pemasukan</Text>
              <Text style={[styles.statValue, styles.incomeValue]}>
                {formatRupiah(pemasukan)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Pengeluaran</Text>
              <Text style={[styles.statValue, styles.expenseValue]}>
                {formatRupiah(pengeluaran)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CALENDAR MODAL */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Pilih Bulan dan Tahun</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              onDayPress={onDateSelect}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: {
                  selected: true,
                  selectedColor: '#5F78BA',
                },
              }}
              theme={{
                selectedDayBackgroundColor: '#5F78BA',
                todayTextColor: '#5F78BA',
                arrowColor: '#5F78BA',
                monthTextColor: '#1F2937',
                textMonthFontWeight: 'bold',
              }}
            />

            <View style={styles.calendarButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.cancelButtonText}>BATAL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.okButton}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.okButtonText}>OKE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#5F78BA" />
          <Text style={[styles.navText, styles.activeText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("RiwayatScreen")}
        >
          <Ionicons name="time-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Riwayat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("LihatTabunganScreen")}
        >
          <MaterialIcons name="savings" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Tabungan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TagihanScreen")}
        >
          <Ionicons name="receipt-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Tagihan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#5F78BA",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  emailText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
  },
  timeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: { 
    color: "rgba(255,255,255,0.85)", 
    fontSize: 13,
    fontWeight: "500",
  },
  balanceAmount: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  incomeExpenseItem: {
    alignItems: 'center',
    flex: 1,
  },
  incomeExpenseLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginBottom: 4,
  },
  incomeAmount: {
    color: "#34D399",
    fontSize: 15,
    fontWeight: "700",
  },
  expenseAmount: {
    color: "#F87171",
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: { 
    paddingHorizontal: 20, 
    flex: 1,
    marginTop: 20,
  },
  quickMenu: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  menuItem: { 
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuText: { 
    fontSize: 11, 
    color: "#374151", 
    fontWeight: "500",
    textAlign: "center",
  },
  dateFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateFilterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateFilterText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  chartContainer: { 
    alignItems: "center", 
    marginBottom: 100,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  chartStyle: { 
    borderRadius: 12,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  incomeValue: {
    color: '#34D399',
  },
  expenseValue: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  calendarButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    gap: 15,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  okButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  okButtonText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  navItem: { 
    flex: 1, 
    alignItems: "center",
    paddingVertical: 5,
  },
  navText: { 
    fontSize: 11, 
    color: "#9CA3AF", 
    marginTop: 4,
    fontWeight: "500",
  },
  activeText: { 
    color: "#5F78BA", 
    fontWeight: "700" 
  },
});