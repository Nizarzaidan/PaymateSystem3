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
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/apiClient";

export default function TagihanScreen() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getTagihan();
    }
  }, [userId]);

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

  const formatNominal = (nominal) => {
    if (!nominal) return "0";
    return nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getTagihan = async (status = "all") => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (status === "all" || status === "Semua") {
        response = await api.get(`/tagihan/pengguna/${userId}`);
      } else {
        response = await api.get(`/tagihan/pengguna/${userId}/status/${status}`);
      }
      
      console.log("Data diterima:", response.data);

      if (Array.isArray(response.data)) {
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

  if (loading && !userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={styles.loadingText}>Memuat data pengguna...</Text>
      </View>
    );
  }

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
      <View style={styles.cardLayout}>
        {/* Icon Left */}
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#FFFFFF" />
        </View>

        {/* Content Center */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.namaTagihan}</Text>
          <Text style={styles.dateText}>{item.tanggalJatuhTempo || "27/10/2025"}</Text>
        </View>

        {/* Status & Amount Right */}
        <View style={styles.rightSection}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === "Lunas" ? "#00B050" : "#B71C1C" }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.amountText}>Rp {formatNominal(item.nominal)}</Text>
        </View>
      </View>
      
      {/* Tombol Bayar Sekarang */}
      {item.status === "Belum Lunas" && (
        <View style={styles.bayarButtonContainer}>
          <TouchableOpacity 
            style={styles.bayarButton}
            onPress={() => handleBayar(item.idTagihan)}
          >
            <Text style={styles.bayarButtonText}>Bayar Sekarang</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FCFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Tagihan</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterText}>Filter</Text>
          <Ionicons name="chevron-down" size={14} color="#0A0A0A" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Background Accent */}
      <View style={styles.backgroundAccent}>
        <Ionicons name="flower" size={200} color="#2691B5" style={{ opacity: 0.15 }} />
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
    backgroundColor: "#F9FCFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FCFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#F9FCFF",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2691B5",
    fontFamily: "Poppins",
    textAlign: "center",
    flex: 1,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 20,
  },
  filterText: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "400",
    fontFamily: "Poppins",
  },
  backgroundAccent: {
    position: "absolute",
    bottom: 150,
    left: "50%",
    marginLeft: -100,
    zIndex: -1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2691B5",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLayout: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2691B5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bellIcon: {
    position: "relative",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bellBody: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 7,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "transparent",
  },
  bellBottom: {
    width: 16,
    height: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 1.5,
    marginTop: -1,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2691B5",
    fontFamily: "Poppins",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#8E8E8E",
    fontWeight: "400",
    fontFamily: "Poppins",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    fontFamily: "Poppins",
  },
  bayarButtonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  bayarButton: {
    backgroundColor: "#2691B5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bayarButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins",
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
    fontFamily: "Poppins",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    fontFamily: "Poppins",
    fontWeight: "500",
  },
  navLabelActive: {
    color: "#2691B5",
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
    fontFamily: "Poppins",
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
    fontFamily: "Poppins",
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
    fontFamily: "Poppins",
  },
});