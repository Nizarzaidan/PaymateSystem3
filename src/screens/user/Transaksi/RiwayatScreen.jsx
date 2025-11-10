import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";

export default function RiwayatScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("semua");
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [userId, setUserId] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTransaksi();
      fetchKategori();
    }
  }, [userId]);

  useEffect(() => {
    applyFilter();
  }, [transaksi, selectedFilter, selectedKategori]);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("👤 User data loaded:", user);
        setUserId(user.idPengguna || user.id);
      } else {
        console.log("❌ No user data found");
      }
    } catch (error) {
      console.error("❌ Error getting user data:", error);
    }
  };

  const fetchTransaksi = async () => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      console.log("🔄 Mengambil data transaksi untuk user:", userId);
      const response = await axios.get(
        `${BASE_URL}/transaksi-keuangan/pengguna/${userId}`
      );
      console.log("📦 Data transaksi diterima:", response.data.length, "items");
      
      const sortedTransaksi = response.data.sort(
        (a, b) => new Date(b.tanggalTransaksi) - new Date(a.tanggalTransaksi)
      );
      
      setTransaksi(sortedTransaksi);
    } catch (error) {
      console.error("❌ Gagal memuat riwayat:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchKategori = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `${BASE_URL}/kategori-transaksi/pengguna/${userId}`
      );
      const activeKategori = response.data.filter(k => k.status !== false);
      setKategoriList(activeKategori);
    } catch (error) {
      console.error("❌ Gagal memuat kategori:", error);
    }
  };

  const applyFilter = () => {
    let filtered = transaksi;
    
    if (selectedFilter === "pemasukan") {
      filtered = transaksi.filter(item => item.tipeTransaksi === "pemasukan");
    } else if (selectedFilter === "pengeluaran") {
      filtered = transaksi.filter(item => item.tipeTransaksi === "pengeluaran");
    }
    
    if (selectedKategori) {
      filtered = filtered.filter(item => {
        const kategoriId = item.kategori?.idKategori || item.kategori;
        return kategoriId === selectedKategori.idKategori;
      });
    }
    
    setFilteredTransaksi(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransaksi();
    fetchKategori();
  };

  const getKategoriName = (kategoriObj) => {
    if (!kategoriObj) return "Lainnya";
    
    if (typeof kategoriObj === 'object') {
      if (kategoriObj.namaKategori) {
        return kategoriObj.namaKategori;
      } else if (kategoriObj.nama) {
        return kategoriObj.nama;
      }
    }
    
    if (typeof kategoriObj === 'string') {
      return kategoriObj;
    }
    
    return "Lainnya";
  };

  const getKategoriIcon = (kategoriObj) => {
    if (!kategoriObj) return "wallet-outline";
    
    if (typeof kategoriObj === 'object' && kategoriObj.ikon) {
      return kategoriObj.ikon;
    }
    
    return "wallet-outline";
  };

  const getKategoriColor = (kategoriObj) => {
    if (!kategoriObj) return "#2691B5";
    
    if (typeof kategoriObj === 'object' && kategoriObj.warna) {
      return kategoriObj.warna;
    }
    
    return "#2691B5";
  };

  const getSafeIcon = (iconName) => {
    const safeIcons = {
      "food-variant": "food",
      "fruit-grapes": "fruit-watermelon",
      "shopping-search": "shopping",
      "rocket": "airplane",
      "ferry": "ship",
      "scooter": "motorbike",
      "filmstrip": "movie",
      "controller-classic": "gamepad-variant",
      "ski": "snowflake",
      "stethoscope": "medical-bag",
      "medical-cotton-swab": "medical-bag",
      "book-open": "book",
      "marker": "pen",
      "notebook": "book",
      "desk-lamp": "lamp",
      "hanger": "tshirt-crew",
      "shoe-formal": "shoe-heel",
      "diamond-stone": "diamond",
      "makeup": "lipstick",
      "mirror": "camera",
      "map-marker": "compass",
      "earth": "compass",
      "island": "palm-tree",
      "weather-night": "weather-sunny",
      "moon-waning-crescent": "weather-sunny",
      "rabbit": "cat",
      "paw": "cat",
      "seed": "leaf",
      "sprout": "leaf",
      "sofa": "chair",
      "toaster": "microwave",
      "washing-machine": "fridge",
      "vacuum": "broom",
      "tape-measure": "ruler",
      "paint-roller": "brush",
      "security": "lock",
      "cellphone-message": "message",
      "forum": "chat",
      "camera-enhance": "camera",
      "ghost": "emoticon",
      "emoticon-sick": "emoticon-sad"
    };
    
    return safeIcons[iconName] || iconName;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const day = days[date.getDay()];
    const dateNum = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day} ${dateNum}-${month}`;
  };

  const groupTransaksiByDate = () => {
    const grouped = {};

    filteredTransaksi.forEach((item) => {
      const dateKey = new Date(item.tanggalTransaksi).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: formatDate(item.tanggalTransaksi),
          dateKey: dateKey,
          pemasukan: 0,
          pengeluaran: 0,
          items: [],
        };
      }

      if (item.tipeTransaksi === "pemasukan") {
        grouped[dateKey].pemasukan += item.nominal;
      } else {
        grouped[dateKey].pengeluaran += item.nominal;
      }

      grouped[dateKey].items.push(item);
    });

    return Object.values(grouped);
  };

  const clearAllFilters = () => {
    setSelectedFilter("semua");
    setSelectedKategori(null);
  };

  const renderTransactionItem = ({ item }) => {
    const isIncome = item.tipeTransaksi === "pemasukan";
    const categoryName = getKategoriName(item.kategori);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.arrowCircle, isIncome ? styles.arrowCircleIncome : styles.arrowCircleExpense]}>
            <Ionicons 
              name={isIncome ? "arrow-down" : "arrow-up"} 
              size={18} 
              color="#fff" 
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.categoryName}>{categoryName}</Text>
            <Text style={styles.transactionNote}>{item.catatan || "Mie Ayam"}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.amount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
            {isIncome ? "+ " : "- "}Rp {item.nominal?.toLocaleString("id-ID") || "0"}
          </Text>
          <Text style={styles.paymentMethod}>Cash</Text>
        </View>
      </View>
    );
  };

  const renderDateGroup = ({ item }) => (
    <View style={styles.dateCard}>
      <View style={styles.dateHeader}>
        <View style={styles.dateHeaderTop}>
          <Ionicons name="calendar" size={16} color="#2691B5" style={{ marginRight: 6 }} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pemasukan </Text>
            <Text style={styles.summaryIncome}>Rp {item.pemasukan.toLocaleString("id-ID")}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pengeluaran </Text>
            <Text style={styles.summaryExpense}>Rp {item.pengeluaran.toLocaleString("id-ID")}</Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionsList}>
        {item.items.map((transaction, index) => (
          <View key={transaction.idTransaksi || index}>
            {renderTransactionItem({ item: transaction })}
          </View>
        ))}
      </View>
    </View>
  );

  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name="filter" size={24} color="#2691B5" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Filter Transaksi</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setFilterModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={28} color="#2691B5" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>📊 Tipe Transaksi</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilter === "semua" && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedFilter("semua")}
                >
                  <Ionicons 
                    name="albums" 
                    size={20} 
                    color={selectedFilter === "semua" ? "#fff" : "#2691B5"} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === "semua" && styles.filterOptionTextActive
                  ]}>
                    Semua
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilter === "pemasukan" && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedFilter("pemasukan")}
                >
                  <Ionicons 
                    name="arrow-down-circle" 
                    size={20} 
                    color={selectedFilter === "pemasukan" ? "#fff" : "#2691B5"} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === "pemasukan" && styles.filterOptionTextActive
                  ]}>
                    Pemasukan
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilter === "pengeluaran" && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedFilter("pengeluaran")}
                >
                  <Ionicons 
                    name="arrow-up-circle" 
                    size={20} 
                    color={selectedFilter === "pengeluaran" ? "#fff" : "#970000"} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === "pengeluaran" && styles.filterOptionTextActive
                  ]}>
                    Pengeluaran
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>🏷️ Kategori</Text>
              <View style={styles.kategoriContainer}>
                <TouchableOpacity
                  style={[
                    styles.kategoriChip,
                    !selectedKategori && styles.kategoriChipActive
                  ]}
                  onPress={() => setSelectedKategori(null)}
                >
                  <Ionicons 
                    name="apps" 
                    size={18} 
                    color={!selectedKategori ? "#fff" : "#2691B5"} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[
                    styles.kategoriChipText,
                    !selectedKategori && styles.kategoriChipTextActive
                  ]}>
                    Semua Kategori
                  </Text>
                </TouchableOpacity>
                
                {kategoriList.map((kategori) => (
                  <TouchableOpacity
                    key={kategori.idKategori}
                    style={[
                      styles.kategoriChip,
                      selectedKategori?.idKategori === kategori.idKategori && styles.kategoriChipActive
                    ]}
                    onPress={() => setSelectedKategori(
                      selectedKategori?.idKategori === kategori.idKategori ? null : kategori
                    )}
                  >
                    <View style={[styles.chipIcon, { backgroundColor: kategori.warna || "#2691B5" }]}>
                      <MaterialCommunityIcons 
                        name={getSafeIcon(kategori.ikon || "wallet-outline")} 
                        size={16} 
                        color="#fff" 
                      />
                    </View>
                    <Text style={[
                      styles.kategoriChipText,
                      selectedKategori?.idKategori === kategori.idKategori && styles.kategoriChipTextActive
                    ]}>
                      {kategori.namaKategori}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Ionicons name="refresh" size={20} color="#2691B5" style={{ marginRight: 6 }} />
              <Text style={styles.clearButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.applyButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={styles.loadingText}>
          ✨ Memuat data pengguna...
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={styles.loadingText}>
          ✨ Memuat riwayat transaksi...
        </Text>
      </View>
    );
  }

  const groupedData = groupTransaksiByDate();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="receipt" size={24} color="#2691B5" />
          <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        </View>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={18} color="#2691B5" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* LIST TRANSAKSI */}
      {groupedData.length > 0 ? (
        <FlatList
          data={groupedData}
          keyExtractor={(item, index) => `${item.dateKey}-${index}`}
          renderItem={renderDateGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2691B5"]}
              tintColor="#2691B5"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={80} color="#2691B5" />
          </View>
          <Text style={styles.emptyTitle}>
            {selectedFilter !== "semua" || selectedKategori 
              ? "Tidak ada transaksi 🔍" 
              : "Belum ada transaksi 📝"
            }
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter !== "semua" || selectedKategori
              ? "Tidak ada transaksi yang sesuai dengan filter"
              : "Mulai catat transaksi pertama Anda"
            }
          </Text>
          {(selectedFilter !== "semua" || selectedKategori) && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={clearAllFilters}>
              <Ionicons name="eye" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.clearFilterButtonText}>Tampilkan Semua</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2691B5",
    fontFamily: "Poppins",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4F8",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#2691B5",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  listContent: {
    padding: 16,
    paddingTop: 16,
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#E8F4F8",
  },
  dateHeader: {
    padding: 16,
    backgroundColor: "#F0F9FF",
    borderBottomWidth: 2,
    borderBottomColor: "#E8F4F8",
  },
  dateHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#2691B5",
    fontWeight: "700",
    fontFamily: "Poppins",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  summaryDivider: {
    width: 2,
    height: 16,
    backgroundColor: "#E8F4F8",
    marginHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#2691B5",
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  summaryIncome: {
    fontSize: 12,
    color: "#2691B5",
    fontWeight: "700",
    fontFamily: "Poppins",
  },
  summaryExpense: {
    fontSize: 12,
    color: "#970000",
    fontWeight: "700",
    fontFamily: "Poppins",
  },
  transactionsList: {
    padding: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 4,
    backgroundColor: "#FAFCFE",
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  arrowCircleIncome: {
    backgroundColor: "#2691B5",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowCircleExpense: {
    backgroundColor: "#970000",
    shadowColor: "#970000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2691B5",
    fontFamily: "Poppins",
    marginBottom: 2,
  },
  transactionNote: {
    fontSize: 12,
    color: "#2691B5",
    fontWeight: "400",
    fontFamily: "Poppins",
    opacity: 0.7,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Poppins",
    marginBottom: 2,
  },
  incomeAmount: {
    color: "#2691B5",
  },
  expenseAmount: {
    color: "#970000",
  },
  paymentMethod: {
    fontSize: 11,
    color: "#2691B5",
    fontWeight: "500",
    fontFamily: "Poppins",
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5F7",
  },
  loadingText: {
    marginTop: 12,
    color: "#2691B5",
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2691B5",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Poppins",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#2691B5",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: "Poppins",
    opacity: 0.7,
  },
  clearFilterButton: {
    backgroundColor: "#2691B5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  clearFilterButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "Poppins",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(38, 145, 181, 0.2)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: "85%",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E8F4F8",
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2691B5",
    fontFamily: "Poppins",
  },
  closeButton: {
    padding: 4,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2691B5",
    marginBottom: 12,
    fontFamily: "Poppins",
  },
  filterOptions: {
    flexDirection: "row",
    gap: 10,
  },
  filterOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8F4F8",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  filterOptionActive: {
    backgroundColor: "#2691B5",
    borderColor: "#2691B5",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },

  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "Poppins",
  },
  filterOptionTextActive: {
    color: "white",
    fontWeight: "600",
  },
  kategoriContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  kategoriChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  kategoriChipActive: {
    backgroundColor: "#2691B5",
    borderColor: "#2691B5",
  },
  chipIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  kategoriChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "Poppins",
  },
  kategoriChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "Poppins",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#2691B5",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    fontFamily: "Poppins",
  },
});