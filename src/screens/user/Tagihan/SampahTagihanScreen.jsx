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

export default function SampahTagihanScreen({ navigation }) {
  const [deletedTagihan, setDeletedTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getDeletedTagihan();
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) {
        getDeletedTagihan();
      }
    });
    return unsubscribe;
  }, [navigation, userId]);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.idPengguna || user.id);
      }
    } catch (error) {
      console.error("❌ Error getting user data:", error);
    }
  };

  const formatNominal = (nominal) => {
    if (!nominal) return "0";
    return nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getDeletedTagihan = async () => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/tagihan/pengguna/${userId}/sampah`);
      
      console.log("Data sampah:", response.data);

      if (Array.isArray(response.data)) {
        setDeletedTagihan(response.data);
      } else {
        setDeletedTagihan([]);
      }
    } catch (error) {
      console.error("Gagal memuat data sampah:", error);
      Alert.alert(
        "Gagal memuat data",
        error.message || "Terjadi kesalahan jaringan."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    setActionModalVisible(false);
    Alert.alert(
      "Pulihkan Tagihan?",
      `Tagihan "${item.namaTagihan}" akan dipulihkan kembali.`,
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Pulihkan",
          onPress: async () => {
            try {
              const response = await api.put(`/tagihan/${item.idTagihan}/restore`);
              if (response.status === 200) {
                Alert.alert("Sukses", "Tagihan berhasil dipulihkan!");
                getDeletedTagihan();
              }
            } catch (error) {
              console.error("Gagal memulihkan tagihan:", error);
              Alert.alert("Gagal", "Tidak dapat memulihkan tagihan.");
            }
          }
        }
      ]
    );
  };

  const handlePermanentDelete = async (item) => {
    setActionModalVisible(false);
    Alert.alert(
      "⚠️ Hapus Permanen?",
      `Tagihan "${item.namaTagihan}" akan dihapus PERMANEN dan tidak bisa dikembalikan!`,
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Hapus Permanen",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete(`/tagihan/${item.idTagihan}/permanent`);
              if (response.status === 200) {
                Alert.alert("Sukses", "Tagihan berhasil dihapus permanen!");
                getDeletedTagihan();
              }
            } catch (error) {
              console.error("Gagal menghapus tagihan:", error);
              Alert.alert("Gagal", "Tidak dapat menghapus tagihan secara permanen.");
            }
          }
        }
      ]
    );
  };

  const openActionModal = (item) => {
    setSelectedTagihan(item);
    setActionModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <View style={styles.iconContainer}>
          <Ionicons name="trash" size={24} color="#FFFFFF" />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.namaTagihan}</Text>
          <Text style={styles.dateText}>
            Dihapus: {formatDate(item.deletedAt)}
          </Text>
          <Text style={styles.dueDateText}>
            Jatuh Tempo: {item.tanggalJatuhTempo}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: "#757575" }
          ]}>
            <Text style={styles.statusText}>Terhapus</Text>
          </View>
          <Text style={styles.amountText}>Rp {formatNominal(item.nominal)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => openActionModal(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#757575" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FCFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2691B5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sampah Tagihan</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#F57C00" />
        <Text style={styles.infoText}>
          Tagihan di sampah bisa dipulihkan atau dihapus permanen
        </Text>
      </View>

      {deletedTagihan.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trash-outline" size={80} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Sampah kosong</Text>
          <Text style={styles.emptyStateSubtext}>
            Tidak ada tagihan yang dihapus
          </Text>
        </View>
      ) : (
        <FlatList
          data={deletedTagihan}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={styles.actionModalContent}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>Pilih Aksi</Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionOption}
              onPress={() => selectedTagihan && handleRestore(selectedTagihan)}
            >
              <Ionicons name="refresh-outline" size={24} color="#00B050" />
              <Text style={[styles.actionOptionText, { color: "#00B050" }]}>
                Pulihkan Tagihan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionOption, styles.deleteOption]}
              onPress={() => selectedTagihan && handlePermanentDelete(selectedTagihan)}
            >
              <Ionicons name="trash-bin" size={24} color="#B71C1C" />
              <Text style={[styles.actionOptionText, styles.deleteText]}>
                Hapus Permanen
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2691B5",
    fontFamily: "Poppins",
    flex: 1,
    textAlign: "center",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F57C00",
  },
  infoText: {
    fontSize: 13,
    color: "#E65100",
    marginLeft: 10,
    flex: 1,
    fontFamily: "Poppins",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
    backgroundColor: "#757575",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
    fontFamily: "Poppins",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: "#757575",
    fontWeight: "400",
    fontFamily: "Poppins",
  },
  dueDateText: {
    fontSize: 11,
    color: "#9E9E9E",
    fontWeight: "400",
    fontFamily: "Poppins",
    marginTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
    marginRight: 8,
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
    color: "#424242",
    fontFamily: "Poppins",
  },
  menuButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#BDBDBD",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Poppins",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  actionModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxWidth: 350,
  },
  actionModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins",
  },
  actionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F0F9FF",
    marginBottom: 12,
  },
  actionOptionText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    fontFamily: "Poppins",
  },
  deleteOption: {
    backgroundColor: "#FFEBEE",
  },
  deleteText: {
    color: "#B71C1C",
  },
});