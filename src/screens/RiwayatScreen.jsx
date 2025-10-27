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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export default function RiwayatScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [groupedTransaksi, setGroupedTransaksi] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("semua"); // semua, pemasukan, pengeluaran

  useEffect(() => {
    fetchTransaksi();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [transaksi, selectedFilter]);

  const fetchTransaksi = async () => {
    try {
      console.log("🔄 Mengambil data transaksi...");
      const response = await axios.get(
        "http://10.66.58.196:8080/api/transaksi-keuangan/pengguna/1"
      );
      console.log("📦 Data transaksi diterima:", response.data.length, "items");
      
      setTransaksi(response.data);
    } catch (error) {
      console.error("❌ Gagal memuat riwayat:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = () => {
    let filtered = transaksi;
    
    if (selectedFilter === "pemasukan") {
      filtered = transaksi.filter(item => item.tipeTransaksi === "pemasukan");
    } else if (selectedFilter === "pengeluaran") {
      filtered = transaksi.filter(item => item.tipeTransaksi === "pengeluaran");
    }
    
    setFilteredTransaksi(filtered);
    groupTransaksiByDate(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransaksi();
  };

  const groupTransaksiByDate = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.tanggalTransaksi).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      if (!grouped[date]) {
        grouped[date] = {
          date,
          pemasukan: 0,
          pengeluaran: 0,
          items: [],
        };
      }

      if (item.tipeTransaksi === "pemasukan") {
        grouped[date].pemasukan += item.nominal;
      } else {
        grouped[date].pengeluaran += item.nominal;
      }

      grouped[date].items.push(item);
    });

    const result = Object.values(grouped).map((group) => ({
      ...group,
      items: group.items.sort(
        (a, b) => new Date(b.tanggalTransaksi) - new Date(a.tanggalTransaksi)
      ),
    }));

    console.log("📊 Data dikelompokkan:", result.length, "group");
    setGroupedTransaksi(result);
  };

  // Fungsi untuk mendapatkan nama kategori dari objek kategori
  const getKategoriName = (kategoriObj) => {
    if (!kategoriObj) return "Lainnya";
    
    if (typeof kategoriObj === 'object') {
      if (kategoriObj.namaKategori) {
        return kategoriObj.namaKategori;
      } else if (kategoriObj.nama) {
        return kategoriObj.nama;
      } else if (kategoriObj.idKategori) {
        return mapKategoriById(kategoriObj.idKategori);
      }
    }
    
    if (typeof kategoriObj === 'string') {
      return kategoriObj;
    }
    
    return "Lainnya";
  };

  // Fallback mapping jika backend tidak mengirim nama kategori
  const mapKategoriById = (idKategori) => {
    const mapping = {
      1: "Makanan",
      2: "Transportasi",
      3: "Belanja",
      4: "Fashion",
      5: "Pendidikan",
      6: "Pulsa",
      7: "Air",
      8: "Listrik",
      9: "Pajak",
      10: "Gaji",
      11: "Investasi",
      12: "Deposit",
    };
    return mapping[idKategori] || "Lainnya";
  };

  const getCategoryIcon = (namaKategori) => {
    const icons = {
      "Makanan": "🍽️",
      "Transportasi": "🚗",
      "Belanja": "🛒",
      "Fashion": "👕",
      "Pendidikan": "📚",
      "Pulsa": "📱",
      "Air": "💧",
      "Listrik": "⚡",
      "Pajak": "📄",
      "Gaji": "💰",
      "Investasi": "📈",
      "Deposit": "🏦",
    };
    return icons[namaKategori] || "📋";
  };

  const getFilterText = () => {
    switch (selectedFilter) {
      case "semua": return "Semua";
      case "pemasukan": return "Pemasukan";
      case "pengeluaran": return "Pengeluaran";
      default: return "Semua";
    }
  };

  const renderTransactionItem = ({ item }) => {
    const isIncome = item.tipeTransaksi === "pemasukan";
    const categoryName = getKategoriName(item.kategori);
    const categoryIcon = getCategoryIcon(categoryName);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.categoryIcon,
              isIncome ? styles.incomeIconBg : styles.expenseIconBg,
            ]}
          >
            <Text style={styles.categoryIconText}>{categoryIcon}</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>
              {categoryName}
            </Text>
            <Text style={styles.transactionNote}>
              {item.catatan || "-"}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.tanggalTransaksi).toLocaleTimeString("id-ID", {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
          {isIncome ? "+ " : "- "}Rp {item.nominal?.toLocaleString("id-ID") || "0"}
        </Text>
      </View>
    );
  };

  const renderDateGroup = ({ item }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{item.date}</Text>
        <View style={styles.summaryContainer}>
          {item.pemasukan > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pemasukan: </Text>
              <Text style={styles.summaryIncome}>
                Rp {item.pemasukan.toLocaleString("id-ID")}
              </Text>
            </View>
          )}
          {item.pengeluaran > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pengeluaran: </Text>
              <Text style={styles.summaryExpense}>
                Rp {item.pengeluaran.toLocaleString("id-ID")}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.transactionsContainer}>
        {item.items.map((transaction) => (
          <View key={transaction.idTransaksi}>
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
          <Text style={styles.modalTitle}>Filter Transaksi</Text>
          
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "semua" && styles.filterOptionActive
            ]}
            onPress={() => {
              setSelectedFilter("semua");
              setFilterModalVisible(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedFilter === "semua" && styles.filterOptionTextActive
            ]}>
              Semua Transaksi
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "pemasukan" && styles.filterOptionActive
            ]}
            onPress={() => {
              setSelectedFilter("pemasukan");
              setFilterModalVisible(false);
            }}
          >
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
            onPress={() => {
              setSelectedFilter("pengeluaran");
              setFilterModalVisible(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedFilter === "pengeluaran" && styles.filterOptionTextActive
            ]}>
              Pengeluaran
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Memuat riwayat transaksi...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterText}>{getFilterText()}</Text>
          <Ionicons name="chevron-down" size={16} color="#2691B5" />
        </TouchableOpacity>
      </View>

      {/* FILTER INFO */}
      {selectedFilter !== "semua" && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            Menampilkan: {getFilterText()}
          </Text>
          <TouchableOpacity onPress={() => setSelectedFilter("semua")}>
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* LIST TRANSAKSI */}
      {groupedTransaksi.length > 0 ? (
        <FlatList
          data={groupedTransaksi}
          keyExtractor={(item, index) => `group-${index}-${item.date}`}
          renderItem={renderDateGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2691B5"]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={50} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {selectedFilter === "semua" 
              ? "Belum ada transaksi" 
              : `Tidak ada transaksi ${getFilterText().toLowerCase()}`
            }
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      <FilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2691B5",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    fontSize: 14,
    color: "#2691B5",
    marginRight: 4,
  },
  filterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DBEAFE",
  },
  filterInfoText: {
    fontSize: 12,
    color: "#2691B5",
    fontWeight: "500",
  },
  dateGroup: {
    marginBottom: 15,
  },
  dateHeader: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2691B5",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  summaryIncome: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  summaryExpense: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  transactionsContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  incomeIconBg: {
    backgroundColor: "#DBEAFE",
  },
  expenseIconBg: {
    backgroundColor: "#FEE2E2",
  },
  categoryIconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4C1D95",
  },
  transactionNote: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  incomeAmount: {
    color: "#059669",
  },
  expenseAmount: {
    color: "#DC2626",
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#2691B5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2691B5",
    marginBottom: 20,
    textAlign: "center",
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: "#2691B5",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  filterOptionTextActive: {
    color: "white",
    fontWeight: "600",
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
});