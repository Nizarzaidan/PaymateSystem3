import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";
import { useTabungan } from "../../../contexts/TabunganContext";
import { useFocusEffect } from "@react-navigation/native";

export default function SampahTabunganScreen({ navigation }) {
  const { 
    sampahList,
    userId,
    initializeUser,
    fetchSampah,
    restoreTabungan,
    hardDeleteTabungan,
    calculateProgress,
    isTargetCompleted
  } = useTabungan();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (!userId) {
        await initializeUser();
      }
    };
    init();
  }, []);

  // Fetch when screen focused
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        loadSampah();
      }
    }, [userId])
  );

  const loadSampah = async () => {
    try {
      await fetchSampah();
    } catch (error) {
      console.error("Error loading sampah:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSampah();
  };

  // Filter out 100% completed items from sampah
  const getFilteredSampah = () => {
    // Only show items that are NOT 100% completed
    return sampahList.filter(item => !isTargetCompleted(item));
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Restore tabungan
  const handleRestore = (id, nama) => {
    Alert.alert(
      "Pulihkan Tabungan",
      `Yakin ingin memulihkan "${nama}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Pulihkan",
          onPress: async () => {
            try {
              const response = await axios.put(
                `${BASE_URL}/target-tabungan/${id}/restore`
              );
              
              if (response.data && response.data.code === 200) {
                // Real-time update
                restoreTabungan(id);
                Alert.alert("✅ Berhasil!", "Tabungan berhasil dipulihkan");
              }
            } catch (error) {
              console.error("Error restore:", error);
              Alert.alert("Error", "Gagal memulihkan tabungan");
            }
          },
        },
      ]
    );
  };

  // Hard delete
  const handleHardDelete = (id, nama) => {
    Alert.alert(
      "⚠️ Hapus Permanen",
      `PERHATIAN!\n\nTabungan "${nama}" akan dihapus PERMANEN dari database dan tidak dapat dipulihkan kembali.\n\nYakin ingin menghapus?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Permanen",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${BASE_URL}/target-tabungan/${id}/permanent`
              );
              
              if (response.data && response.data.code === 200) {
                // Real-time update
                hardDeleteTabungan(id);
                Alert.alert("✅ Dihapus", "Tabungan berhasil dihapus permanen");
              }
            } catch (error) {
              console.error("Error hard delete:", error);
              Alert.alert("Error", "Gagal menghapus tabungan");
            }
          },
        },
      ]
    );
  };

  // Delete all (only items that are not 100%)
  const handleDeleteAll = () => {
    const filteredList = getFilteredSampah();
    
    if (filteredList.length === 0) {
      Alert.alert("Info", "Tidak ada tabungan yang dapat dihapus di sampah");
      return;
    }

    Alert.alert(
      "⚠️ Hapus Semua Sampah",
      `PERHATIAN!\n\nSemua ${filteredList.length} tabungan di sampah akan dihapus PERMANEN dan tidak dapat dipulihkan.\n\nYakin ingin melanjutkan?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Semua",
          style: "destructive",
          onPress: async () => {
            try {
              const deletePromises = filteredList.map(item => 
                axios.delete(`${BASE_URL}/target-tabungan/${item.idTarget}/permanent`)
              );
              
              await Promise.all(deletePromises);
              
              // Real-time update
              filteredList.forEach(item => hardDeleteTabungan(item.idTarget));
              
              Alert.alert("✅ Berhasil", "Semua tabungan berhasil dihapus");
            } catch (error) {
              console.error("Error delete all:", error);
              Alert.alert("Error", "Gagal menghapus beberapa tabungan");
              await loadSampah();
            }
          },
        },
      ]
    );
  };

  // Render item
  const renderSampahItem = ({ item }) => {
    const progress = calculateProgress(item.nominalSekarang, item.targetNominal);

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.namaTarget}
            </Text>
          </View>
          <View style={styles.deletedBadge}>
            <Text style={styles.deletedText}>Dihapus</Text>
          </View>
        </View>

        {/* Foto */}
        {item.fotoTabungan && (
          <Image 
            source={{ uri: item.fotoTabungan }} 
            style={styles.tabunganImage}
            resizeMode="cover"
          />
        )}

        {/* Nominal Info */}
        <View style={styles.nominalSection}>
          <View style={styles.nominalBox}>
            <Text style={styles.labelText}>Terkumpul</Text>
            <Text style={styles.nominalText}>
              {formatCurrency(item.nominalSekarang)}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.nominalBox}>
            <Text style={styles.labelText}>Target</Text>
            <Text style={styles.nominalText}>
              {formatCurrency(item.targetNominal)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress: {progress.toFixed(1)}%</Text>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
        </View>

        {/* Deleted Info */}
        <View style={styles.deleteInfoBox}>
          <Ionicons name="time-outline" size={16} color="#EF4444" />
          <Text style={styles.deleteInfoText}>
            Dihapus pada: {formatDate(item.deletedAt)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={() => handleRestore(item.idTarget, item.namaTarget)}
          >
            <Ionicons name="reload-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Pulihkan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.permanentDeleteBtn}
            onPress={() => handleHardDelete(item.idTarget, item.namaTarget)}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Hapus Permanen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={styles.loadingText}>Memuat sampah...</Text>
      </View>
    );
  }

  const filteredSampah = getFilteredSampah();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Sampah Tabungan 🗑️</Text>
            <Text style={styles.headerSubtitle}>
              {filteredSampah.length} tabungan terhapus
            </Text>
          </View>
        </View>

        {filteredSampah.length > 0 && (
          <TouchableOpacity
            style={styles.deleteAllBtn}
            onPress={handleDeleteAll}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info Box */}
      {filteredSampah.length > 0 && (
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Tabungan yang dihapus permanen tidak dapat dipulihkan kembali.
          </Text>
        </View>
      )}

      {/* Info: Items with 100% are hidden */}
      {sampahList.length > filteredSampah.length && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#10B981" />
          <Text style={styles.infoText}>
            ✅ Tabungan yang sudah mencapai 100% tidak ditampilkan karena dilindungi dari penghapusan.
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredSampah}
        renderItem={renderSampahItem}
        keyExtractor={(item) => item.idTarget.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#2691B5"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="delete-sweep" size={100} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              Sampah Kosong 🎉
            </Text>
            <Text style={styles.emptySubtitle}>
              {sampahList.length > 0 
                ? "Semua tabungan di sampah sudah mencapai 100% dan dilindungi dari penghapusan" 
                : "Tidak ada tabungan yang dihapus"}
            </Text>
            <TouchableOpacity
              style={styles.backToListButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back-circle" size={22} color="#fff" />
              <Text style={styles.backToListButtonText}>Kembali ke Daftar Tabungan</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
  },
  loadingText: {
    marginTop: 10,
    color: "#2691B5",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FEE2E2",
    marginTop: 2,
  },
  deleteAllBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#D1FAE5",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#065F46",
    lineHeight: 18,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#991B1B",
    flex: 1,
  },
  deletedBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deletedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  tabunganImage: {
    width: "100%",
    height: 160,
    marginBottom: 16,
    opacity: 0.7,
  },
  nominalSection: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  nominalBox: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 2,
    backgroundColor: "#FCA5A5",
    marginHorizontal: 16,
  },
  labelText: {
    fontSize: 12,
    color: "#991B1B",
    marginBottom: 6,
    fontWeight: "500",
  },
  nominalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
    textTransform: "capitalize",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#EF4444",
    borderRadius: 10,
  },
  deleteInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  deleteInfoText: {
    fontSize: 13,
    color: "#991B1B",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  restoreBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 15,
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permanentDeleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 15,
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#2691B5",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
  backToListButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2691B5",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  backToListButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});