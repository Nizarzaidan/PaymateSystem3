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

  // ✅ Daftar kategori berdasarkan tipe transaksi
  const kategoriList = {
    pengeluaran: [
      { id_kategori: 3, nama_kategori: "Fashion" },
      { id_kategori: 4, nama_kategori: "Pendidikan" },
      { id_kategori: 5, nama_kategori: "Pulsa" },
      { id_kategori: 6, nama_kategori: "Air" },
      { id_kategori: 7, nama_kategori: "Listrik" },
      { id_kategori: 8, nama_kategori: "Pajak" },
      { id_kategori: 10, nama_kategori: "Makanan" },
      { id_kategori: 11, nama_kategori: "Transportasi" },
      { id_kategori: 12, nama_kategori: "Belanja" },
    ],
    pemasukan: [
      { id_kategori: 1, nama_kategori: "Deposit" },
      { id_kategori: 2, nama_kategori: "Investasi" },
      { id_kategori: 9, nama_kategori: "Gaji" },
    ],
  };

  // ✅ Fungsi bantu untuk mencari nama kategori
  const getNamaKategori = (id, tipeTransaksi) => {
    const list = kategoriList[tipeTransaksi] || [];
    const kategori = list.find((k) => k.id_kategori === id);
    return kategori ? kategori.nama_kategori : "Tidak diketahui";
  };

  // ✅ Tampilan tiap item
  const renderItem = ({ item }) => {
    // Ambil nama kategori berdasarkan id dan tipe
    const idKategori = item.kategori?.id_kategori || item.kategori || null;
    const namaKategori = getNamaKategori(idKategori, item.tipeTransaksi);

    return (
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
              color={
                item.tipeTransaksi === "pemasukan" ? "#00ff99ff" : "#ff0000ff"
              }
            />
          </View>

          <View style={{ flex: 1 }}>
            {/* ✅ Nama kategori tampil di sini */}
            <Text style={styles.itemCategory}>
              {(() => {
                // pastikan jenis_transaksi selalu lowercase biar cocok
                const jenisTransaksiKey = item.jenis_transaksi?.toLowerCase();

                const kategoriArray = kategoriList[jenisTransaksiKey] || [];

                // pastikan id_kategori dibandingkan sebagai integer
                const kategori = kategoriArray.find(
                  (k) => k.id_kategori === parseInt(item.id_kategori)
                );

                return kategori ? kategori.nama_kategori : "Tidak diketahui";
              })()}
            </Text>

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
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#60A5FA", "#2563EB"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Memuat riwayat transaksi...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <Ionicons name="file-tray-outline" size={60} color="#C4B5FD" />
          <Text style={styles.emptyText}>Belum ada transaksi</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#E9D5FF",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  incomeBg: {
    backgroundColor: "#E0F2FE",
  },
  expenseBg: {
    backgroundColor: "#FEE2E2",
  },
  itemCategory: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  itemDesc: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4C1D95",
  },
  itemDate: {
    fontSize: 12,
    color: "#7E22CE",
    marginTop: 3,
  },
  incomeText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 14,
  },
  expenseText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#7C3AED",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
  },
});
