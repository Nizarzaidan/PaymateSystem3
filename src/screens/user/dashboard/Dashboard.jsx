import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../../api/apiClient";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Reward states
  const [poin, setPoin] = useState(0);
  const [medali, setMedali] = useState(0);
  const [level, setLevel] = useState("Pemula");
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [pemasukanBulanIni, setPemasukanBulanIni] = useState(0);
  const [pengeluaranBulanIni, setPengeluaranBulanIni] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [transaksiData, setTransaksiData] = useState([]);

<<<<<<< HEAD:src/screens/Dashboard.jsx
=======
  const levelData = {
    Pemula: { minMedal: 0, color: "#6B7280", icon: "🌱" },
    Perunggu: { minMedal: 1, color: "#CD7F32", icon: "🥉" },
    Perak: { minMedal: 3, color: "#C0C0C0", icon: "🥈" },
    Emas: { minMedal: 5, color: "#FFD700", icon: "🥇" },
    Platinum: { minMedal: 8, color: "#E5E4E2", icon: "🏆" },
    Berlian: { minMedal: 12, color: "#B9F2FF", icon: "💎" },
  };

>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isFocused && userId) {
      fetchAllData();
      fetchRewardData();
    }
  }, [selectedDate, isFocused, userId]);

  // Update level ketika medali berubah
  useEffect(() => {
    if (medali >= levelData.Berlian.minMedal) setLevel("Berlian");
    else if (medali >= levelData.Platinum.minMedal) setLevel("Platinum");
    else if (medali >= levelData.Emas.minMedal) setLevel("Emas");
    else if (medali >= levelData.Perak.minMedal) setLevel("Perak");
    else if (medali >= levelData.Perunggu.minMedal) setLevel("Perunggu");
    else setLevel("Pemula");
  }, [medali]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const userDataString = await AsyncStorage.getItem("userData");
      
      if (token && userDataString) {
        const userData = JSON.parse(userDataString);
        setUserData(userData);
        setUserId(userData.idPengguna || userData.id);
      } else {
        navigation.replace("LoginScreen");
      }
    } catch (error) {
      console.error("❌ Auth check error:", error);
      navigation.replace("LoginScreen");
    }
  };

  const fetchRewardData = async () => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/reward-gamification/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem("jwtToken")}`
          }
        }
      );

      if (response.data && response.data.code === 200) {
        const rewardInfo = response.data.data;
        setPoin(rewardInfo.poin || 0);
        setMedali(rewardInfo.medali || 0);
      }
    } catch (error) {
      console.error("❌ Error fetching reward data:", error);
    }
  };

  const fetchAllData = async () => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      setLoading(true);
<<<<<<< HEAD:src/screens/Dashboard.jsx
      const idPengguna = 1;

      const response = await api.get(
        `/transaksi-keuangan/pengguna/${idPengguna}/laporan/rekap`
=======
      
      // Fetch transaksi data
      const transaksiResponse = await axios.get(
        `${BASE_URL}/transaksi-keuangan/pengguna/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem("jwtToken")}`
          }
        }
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
      );

      
      setTransaksiData(transaksiResponse.data);
      calculateTotalSaldo(transaksiResponse.data);
      calculateMonthlyData(transaksiResponse.data);
      processChartData(transaksiResponse.data);
      
    } catch (error) {
      console.error("❌ Error:", error);
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        navigation.replace("LoginScreen");
      }
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD:src/screens/Dashboard.jsx
  const fetchTransaksiForChart = async () => {
    try {
      const idPengguna = 1;
      const response = await api.get(
        `/transaksi-keuangan/pengguna/${idPengguna}`
      );

      console.log(
        "📊 Data transaksi untuk grafik:",
        response.data.length,
        "items"
      );
      setTransaksiData(response.data);

      // Process data untuk grafik
      processChartData(response.data);
    } catch (error) {
      console.error("❌ Gagal memuat data transaksi:", error);
    }
  };

  const processChartData = (transaksi) => {
    // ✅ Lindungi agar tidak error kalau data belum siap
    if (!Array.isArray(transaksi)) {
      console.warn("Data transaksi belum siap:", transaksi);
      transaksi = [];
    }

=======
  const calculateTotalSaldo = (transaksi) => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    transaksi.forEach(item => {
      if (item.tipeTransaksi === "pemasukan") {
        totalPemasukan += item.nominal || 0;
      } else {
        totalPengeluaran += item.nominal || 0;
      }
    });

    setTotalSaldo(totalPemasukan - totalPengeluaran);
  };

  const calculateMonthlyData = (transaksi) => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    
    const transaksisBulanIni = transaksi.filter(item => {
      const transaksiDate = new Date(item.tanggalTransaksi);
      return transaksiDate.getFullYear() === selectedYear && 
             transaksiDate.getMonth() === selectedMonth;
    });

    let pemasukan = 0;
    let pengeluaran = 0;

    transaksisBulanIni.forEach(item => {
      if (item.tipeTransaksi === "pemasukan") {
        pemasukan += item.nominal || 0;
      } else {
        pengeluaran += item.nominal || 0;
      }
    });

    setPemasukanBulanIni(pemasukan);
    setPengeluaranBulanIni(pengeluaran);
  };

  const processChartData = (transaksi) => {
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    const filteredTransaksi = transaksi.filter((item) => {
      if (!item || !item.tanggalTransaksi) return false;
      const transaksiDate = new Date(item.tanggalTransaksi);
      return (
        transaksiDate.getFullYear() === selectedYear &&
        transaksiDate.getMonth() === selectedMonth
      );
    });

<<<<<<< HEAD:src/screens/Dashboard.jsx
    const weeklyData = groupDataByWeek(
      filteredTransaksi,
      selectedYear,
      selectedMonth
    );
=======
    const weeklyData = groupDataByWeek(filteredTransaksi, selectedYear, selectedMonth);
    
    const labels = weeklyData.map(week => `Minggu ${week.week}`);
    const pemasukanData = weeklyData.map(week => week.pemasukan);
    const pengeluaranData = weeklyData.map(week => week.pengeluaran);
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx

    // ✅ Jika weeklyData tidak array, jadikan array kosong
    const safeWeeklyData = Array.isArray(weeklyData) ? weeklyData : [];

    const labels = safeWeeklyData.map((week) => `Minggu ${week.week}`);
    const pemasukanData = safeWeeklyData.map((week) => week.pemasukan);
    const pengeluaranData = safeWeeklyData.map((week) => week.pengeluaran);

    setChartData({
      labels: labels.length > 0 ? labels : ["M1", "M2", "M3", "M4"],
      datasets: [
        {
<<<<<<< HEAD:src/screens/Dashboard.jsx
          data: pemasukanData.length > 0 ? pemasukanData : [0, 0, 0, 0],
=======
          data: pemasukanData,
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
          color: () => "#34D399",
          strokeWidth: 2,
        },
        {
<<<<<<< HEAD:src/screens/Dashboard.jsx
          data: pengeluaranData.length > 0 ? pengeluaranData : [0, 0, 0, 0],
=======
          data: pengeluaranData,
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
          color: () => "#EF4444",
          strokeWidth: 2,
        },
      ],
      legend: ["Pemasukan", "Pengeluaran"],
    });
  };

  // ✅ groupDataByWeek juga dilindungi
  const groupDataByWeek = (transaksi, year, month) => {
<<<<<<< HEAD:src/screens/Dashboard.jsx
    if (!Array.isArray(transaksi)) return [];

    const weeks = [];
    for (let i = 1; i <= 4; i++) {
      weeks.push({ week: i, pemasukan: 0, pengeluaran: 0 });
    }

    transaksi.forEach((item) => {
      const date = new Date(item.tanggalTransaksi);
      const week = Math.ceil(date.getDate() / 7);
      if (week >= 1 && week <= 4) {
        if (item.jenis === "Pemasukan")
          weeks[week - 1].pemasukan += item.jumlah;
        else if (item.jenis === "Pengeluaran")
          weeks[week - 1].pengeluaran += item.jumlah;
=======
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let currentWeek = 1;
    let currentDate = new Date(firstDay);
    
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
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
      }
    });

    return weeks;
  };

  const formatRupiah = (value) => {
    if (isNaN(value)) return "Rp 0";
    return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatBalanceDisplay = (value) => {
<<<<<<< HEAD:src/screens/Dashboard.jsx
    if (!showBalance) {
      return "Tampilkan Saldo";
    }
=======
    if (!showBalance) return "••••••••";
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
    return formatRupiah(value);
  };

  const formatDate = (date) => {
    const months = [
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
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onDateSelect = (day) => {
    const selected = new Date(day.dateString);
    setSelectedDate(selected);
    setShowCalendar(false);
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

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

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("LoginScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>
              Selamat Datang, {userData?.nama_lengkap || "User"}!
            </Text>
            <Text style={styles.emailText}>{userData?.email || ""}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timeText}>{getCurrentTime()}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* REWARD CARD - BARU */}
        <TouchableOpacity 
          onPress={() => navigation.navigate("RewardTarget")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rewardCard}
          >
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <View style={styles.rewardHeader}>
                <Text style={styles.rewardIcon}>{levelData[level].icon}</Text>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardLevel}>Level: {level}</Text>
                  <View style={styles.rewardStats}>
                    <Text style={styles.rewardText}>💰 {poin} Poin</Text>
                    <Text style={styles.rewardDivider}>•</Text>
                    <Text style={styles.rewardText}>🏅 {medali} Medali</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </View>
            </Animatable.View>
          </LinearGradient>
        </TouchableOpacity>

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
                <View>
                  <Text style={styles.balanceLabel}>Total Saldo</Text>
                  <Text style={styles.balanceSubLabel}>Keseluruhan (All Time)</Text>
                </View>
                <TouchableOpacity onPress={toggleBalanceVisibility}>
                  <Ionicons
                    name={showBalance ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.balanceAmount}>
                {formatBalanceDisplay(totalSaldo)}
              </Text>

              <View style={styles.monthInfoContainer}>
                <Text style={styles.monthInfoText}>
                  {formatDate(selectedDate)}
                </Text>
              </View>

              <View style={styles.incomeExpenseContainer}>
                <View style={styles.incomeExpenseItem}>
                  <Text style={styles.incomeExpenseLabel}>Pemasukan Bulan Ini</Text>
                  <Text style={styles.incomeAmount}>
                    {formatBalanceDisplay(pemasukanBulanIni)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.incomeExpenseItem}>
                  <Text style={styles.incomeExpenseLabel}>Pengeluaran Bulan Ini</Text>
                  <Text style={styles.expenseAmount}>
                    {formatBalanceDisplay(pengeluaranBulanIni)}
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
            onPress={() => navigation.navigate("TambahTransaksiScreen")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#E0F2FE" }]}>
              <Ionicons name="add-circle" size={28} color="#0EA5E9" />
            </View>
            <Text style={styles.menuText}>Tambah Transaksi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TabunganScreen")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#F0FDFA" }]}>
              <MaterialIcons name="savings" size={28} color="#14B8A6" />
            </View>
            <Text style={styles.menuText}>Tabungan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TambahTagihanScreen")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#FEF3C7" }]}>
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
            <Text style={styles.dateFilterText}>
              {formatDate(selectedDate)}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* GRAFIK */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Grafik Keuangan {formatDate(selectedDate)}
          </Text>

          {chartData && chartData.labels && chartData.datasets ? (
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

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#34D399" }]}
              />
              <Text style={styles.legendText}>Pemasukan</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#EF4444" }]}
              />
              <Text style={styles.legendText}>Pengeluaran</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Pemasukan</Text>
              <Text style={[styles.statValue, styles.incomeValue]}>
                {formatRupiah(pemasukanBulanIni)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Pengeluaran</Text>
              <Text style={[styles.statValue, styles.expenseValue]}>
                {formatRupiah(pengeluaranBulanIni)}
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
              current={selectedDate.toISOString().split("T")[0]}
              onDayPress={onDateSelect}
              markedDates={{
                [selectedDate.toISOString().split("T")[0]]: {
                  selected: true,
                  selectedColor: "#5F78BA",
                },
              }}
              theme={{
                selectedDayBackgroundColor: "#5F78BA",
                todayTextColor: "#5F78BA",
                arrowColor: "#5F78BA",
                monthTextColor: "#1F2937",
                textMonthFontWeight: "bold",
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("ProfileScreen")}
        >
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  // REWARD CARD STYLES - BARU
  rewardCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLevel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  rewardStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
  rewardDivider: {
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 8,
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
<<<<<<< HEAD:src/screens/Dashboard.jsx
  balanceLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
=======
  balanceLabel: { 
    color: "rgba(255,255,255,0.95)", 
    fontSize: 14,
    fontWeight: "600",
  },
  balanceSubLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/dashboard/Dashboard.jsx
  },
  balanceAmount: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  monthInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  monthInfoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  incomeExpenseContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  incomeExpenseItem: {
    alignItems: "center",
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
    backgroundColor: "rgba(255,255,255,0.2)",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
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
    flexDirection: "row",
    alignItems: "center",
  },
  dateFilterText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
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
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  incomeValue: {
    color: "#34D399",
  },
  expenseValue: {
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  calendarButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    gap: 15,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  okButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  okButtonText: {
    color: "#0EA5E9",
    fontSize: 14,
    fontWeight: "600",
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  navItem: { flex: 1, alignItems: "center" },
  navText: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  activeText: { color: "#6D28D9", fontWeight: "600" },
});
