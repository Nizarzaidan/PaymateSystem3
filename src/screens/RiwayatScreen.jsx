import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export default function RiwayatScreen() {
  const [loading, setLoading] = useState(true);
  const [transaksi, setTransaksi] = useState([]);

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      const response = await axios.get(
        "http://10.1.5.173:8080/api/transaksi-keuangan/pengguna/1"
      );
      setTransaksi(response.data);
    } catch (error) {
      console.error("Gagal memuat riwayat:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View
          style={[
            styles.iconWrapper,
            item.tipeTransaksi === "pemasukan"
              ? styles.incomeBg
              : styles.expenseBg,
          ]}
        >
          <Ionicons
            name={
              item.tipeTransaksi === "pemasukan"
                ? "arrow-down-circle"
                : "arrow-up-circle"
            }
            size={26}
            color={item.tipeTransaksi === "pemasukan" ? "#16A34A" : "#DC2626"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemDesc}>{item.catatan || "-"}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.tanggalTransaksi).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <Text
          style={
            item.tipeTransaksi === "pemasukan"
              ? styles.incomeText
              : styles.expenseText
          }
        >
          {item.tipeTransaksi === "pemasukan" ? "+" : "-"} Rp{" "}
          {item.nominal.toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Memuat riwayat transaksi...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DENGAN GRADIENT */}
      {/* HEADER DENGAN GRADIENT UNGU */}
      <LinearGradient
        colors={["#A855F7", "#6D28D9"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <Text style={styles.headerSubtitle}>
          Lihat catatan pemasukan & pengeluaran Anda
        </Text>
      </LinearGradient>

      {/* LIST TRANSAKSI */}
      {transaksi.length > 0 ? (
        <FlatList
          data={transaksi}
          keyExtractor={(item) =>
            item.idTransaksi?.toString() || item.id?.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={50} color="#9CA3AF" />
          <Text style={styles.emptyText}>Belum ada transaksi</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    elevation: 4,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  incomeBg: {
    backgroundColor: "#DCFCE7",
  },
  expenseBg: {
    backgroundColor: "#FEE2E2",
  },
  itemDesc: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  itemDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
  incomeText: {
    color: "#16A34A",
    fontWeight: "700",
    fontSize: 14,
  },
  expenseText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },
});
