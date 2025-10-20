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
  LinearGradient,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/apiClient";

export default function TagihanScreen() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTagihan();
  }, []);

  const getTagihan = async () => {
    try {
      const response = await api.get("/tagihan/pengguna/1");
      console.log("Data diterima:", response.data);

      if (Array.isArray(response.data)) {
        setTagihan(response.data);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A5AE0" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color="#6A5AE0"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.cardTitle}>{item.namaTagihan}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === "Lunas" ? styles.statusPaid : styles.statusUnpaid,
          ]}
        >
          <Ionicons
            name={item.status === "Lunas" ? "checkmark-circle" : "alert-circle"}
            size={14}
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

      <View style={styles.cardContent}>
        <Text style={styles.amountText}>Rp {item.nominal}</Text>
        <Text style={styles.dateText}>
          Jatuh Tempo: {item.tanggalJatuhTempo || "27/02/2025"}
        </Text>
      </View>

      <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>Lihat Detail</Text>
        <Ionicons name="chevron-forward" size={16} color="#6A5AE0" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6A5AE0" />

      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>💳 Daftar Tagihan</Text>
        <Text style={styles.headerSubtitle}>
          Pantau dan kelola semua tagihanmu di sini
        </Text>
      </View> */}

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
    backgroundColor: "#6A5AE0",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#6A5AE0",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    fontSize: 14,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  statusPaid: {
    backgroundColor: "#E8F9EE",
  },
  statusUnpaid: {
    backgroundColor: "#FDEDEC",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardContent: {
    marginBottom: 8,
  },
  amountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#777",
  },
  detailButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  detailButtonText: {
    fontSize: 14,
    color: "#6A5AE0",
    fontWeight: "600",
    marginRight: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
});
