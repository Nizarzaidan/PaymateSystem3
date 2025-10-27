import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/apiClient";

export default function TagihanScreen() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua");

  useEffect(() => {
    getTagihan();
  }, []);

  // Fungsi untuk format nominal dengan separator
  const formatNominal = (nominal) => {
    if (!nominal) return "0";
    
    // Konversi ke string dan format dengan separator
    return nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getTagihan = async (status = "all") => {
    try {
      setLoading(true);
      let response;
      
      if (status === "all" || status === "Semua") {
        response = await api.get("/tagihan/pengguna/1");
      } else {
        response = await api.get(`/tagihan/pengguna/1/status/${status}`);
      }
      
      console.log("Data diterima:", response.data);

      if (Array.isArray(response.data)) {
        // Reverse array untuk menampilkan data baru di paling atas
        setTagihan(response.data.reverse());
      } else {
        console.warn("Data bukan array:", response.data);
        setTagihan([]);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
      Alert.alert(
        "Gagal memuat data",
        error.message || "Terjadi kesalahan jaringan."
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterModalVisible(false);
    
    let status = "all";
    if (filter === "Lunas") status = "Lunas";
    if (filter === "Belum Lunas") status = "Belum Lunas";
    
    getTagihan(status);
  };

  const handleBayar = async (id) => {
    try {
      const response = await api.put(`/tagihan/${id}/bayar`);
      if (response.status === 200) {
        Alert.alert("Sukses", "Tagihan berhasil dibayar!");
        getTagihan(selectedFilter === "Semua" ? "all" : selectedFilter);
      }
    } catch (error) {
      console.error("Gagal membayar tagihan:", error);
      Alert.alert("Gagal", "Tidak dapat membayar tagihan.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.namaTagihan}</Text>
        <Text style={styles.dateText}>{item.tanggalJatuhTempo || "27/10/2025"}</Text>
      </View>

      <View style={styles.cardContent}>
        {/* Menggunakan formatNominal untuk menampilkan nominal dengan separator */}
        <Text style={styles.amountText}>Rp {formatNominal(item.nominal)}</Text>
        <View style={styles.statusContainer}>
          <Ionicons
            name={item.status === "Lunas" ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={item.status === "Lunas" ? "#2ECC71" : "#E74C3C"}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.statusText,
              { color: item.status === "Lunas" ? "#2ECC71" : "#E74C3C" },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      
      {item.status === "Belum Lunas" && (
        <TouchableOpacity 
          style={styles.bayarButton}
          onPress={() => handleBayar(item.idTagihan)}
        >
          <Text style={styles.bayarButtonText}>Bayar Sekarang</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2691B5" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Tagihan</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#2691B5" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Info */}
      <View style={styles.filterInfo}>
        <Text style={styles.filterInfoText}>
          Filter: {selectedFilter}
        </Text>
      </View>

      {/* Daftar Tagihan */}
      {tagihan.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Tidak ada tagihan saat ini.</Text>
        </View>
      ) : (
        <FlatList
          data={tagihan}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Status</Text>
            
            {["Semua", "Lunas", "Belum Lunas"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  selectedFilter === filter && styles.filterOptionSelected
                ]}
                onPress={() => applyFilter(filter)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === filter && styles.filterOptionTextSelected
                ]}>
                  {filter}
                </Text>
                {selectedFilter === filter && (
                  <Ionicons name="checkmark" size={20} color="#2691B5" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2691B5",
  },
  filterText: {
    fontSize: 14,
    color: "#2691B5",
    fontWeight: "500",
    marginLeft: 4,
  },
  filterInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#E3F2FD",
  },
  filterInfoText: {
    fontSize: 14,
    color: "#2691B5",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#2691B5",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: "#777",
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bayarButton: {
    backgroundColor: "#2691B5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  bayarButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
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
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: "#E3F2FD",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
  },
  filterOptionTextSelected: {
    color: "#2691B5",
    fontWeight: "600",
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#2691B5",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});