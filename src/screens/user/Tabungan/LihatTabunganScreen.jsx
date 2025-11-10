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
  Modal,
  TextInput,
  Animated,
  Easing
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
<<<<<<< HEAD:src/screens/LihatTabunganScreen.jsx
import api from "../api/apiClient";
=======
import { BASE_URL } from "../../../api/apiClient";
import { RewardAnimation } from "../../../components/RewardAnimation";
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/LihatTabunganScreen.jsx

export default function LihatTabunganScreen({ navigation }) {
  const [tabunganList, setTabunganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("semua");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTabungan, setSelectedTabungan] = useState(null);
  const [nominalInput, setNominalInput] = useState("");
  const [userId, setUserId] = useState(null);
  
  // State untuk animasi reward
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardType, setRewardType] = useState('poin');
  const [rewardMessage, setRewardMessage] = useState('');
  const [currentPoin, setCurrentPoin] = useState(0);
  const [currentMedali, setCurrentMedali] = useState(0);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTabungan();
      fetchRewardData();
    }
  }, [userId]);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.idPengguna || user.id);
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  };

  // Fetch data tabungan
  const fetchTabungan = async () => {
    if (!userId) {
      console.log("User ID not available");
      return;
    }

    try {
<<<<<<< HEAD:src/screens/LihatTabunganScreen.jsx
      const idPengguna = 1; // Ganti dengan ID user yang login dari AsyncStorage
      const response = await api.get(`/target-tabungan/pengguna/${idPengguna}`);
=======
      const response = await axios.get(
        `${BASE_URL}/target-tabungan/pengguna/${userId}`
      );
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/LihatTabunganScreen.jsx

      if (response.data) {
        setTabunganList(response.data);
      }
    } catch (error) {
      console.error("Error fetching tabungan:", error);
<<<<<<< HEAD:src/screens/LihatTabunganScreen.jsx
      Alert.alert(
        "Error",
        "Gagal memuat data tabungan. Periksa koneksi internet dan pastikan server aktif."
      );
=======
      Alert.alert("Error", "Gagal memuat data tabungan.");
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/LihatTabunganScreen.jsx
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data reward
  const fetchRewardData = async () => {
    if (!userId) return;

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(
        `${BASE_URL}/reward-gamification/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.code === 200) {
        const rewardInfo = response.data.data;
        setCurrentPoin(rewardInfo.poin || 0);
        setCurrentMedali(rewardInfo.medali || 0);
      }
    } catch (error) {
      console.error("Error fetching reward data:", error);
    }
  };

  // Refresh data
  const onRefresh = () => {
    setRefreshing(true);
    fetchTabungan();
    fetchRewardData();
  };

  // Filter data berdasarkan status
  const getFilteredData = () => {
    if (filter === "semua") {
      return tabunganList;
    } else if (filter === "selesai") {
      return tabunganList.filter((item) => item.status === "selesai");
    }
    return tabunganList;
  };

  // Hitung persentase progress
  const calculateProgress = (nominalSekarang, targetNominal) => {
    if (targetNominal <= 0) return 0;
    const progress = (nominalSekarang / targetNominal) * 100;
    return Math.min(progress, 100);
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

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format input currency
  const formatInputCurrency = (value) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Buka modal tambah nominal
  const openTambahModal = (item) => {
    setSelectedTabungan(item);
    setNominalInput("");
    setModalVisible(true);
  };

  // Tambah nominal tabungan dengan animasi reward
  const handleTambahNominal = async () => {
    if (!nominalInput || nominalInput === "0") {
      Alert.alert("Error", "Masukkan nominal yang valid");
      return;
    }

    const nominal = parseFloat(nominalInput.replace(/\./g, ""));

    if (isNaN(nominal) || nominal <= 0) {
      Alert.alert("Error", "Nominal harus lebih dari 0");
      return;
    }

    try {
<<<<<<< HEAD:src/screens/LihatTabunganScreen.jsx
      const response = await api.put(
        `/target-tabungan/${selectedTabungan.idTarget}/tambah?nominal=${nominal}`
=======
      // Simpan state sebelum update
      const previousPoin = currentPoin;
      const previousMedali = currentMedali;

      const response = await axios.put(
        `${BASE_URL}/target-tabungan/${selectedTabungan.idTarget}/tambah?nominal=${nominal}`
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/LihatTabunganScreen.jsx
      );

      if (response.data && response.data.code === 200) {
        // Cek apakah target tercapai
        const newNominal = selectedTabungan.nominalSekarang + nominal;
        const isCompleted = newNominal >= selectedTabungan.targetNominal;

        setModalVisible(false);
<<<<<<< HEAD:src/screens/LihatTabunganScreen.jsx

        if (isCompleted) {
          Alert.alert(
            "🎉 Selamat!",
            `Target tabungan "${selectedTabungan.namaTarget}" berhasil tercapai!`,
            [{ text: "OK", onPress: () => fetchTabungan() }]
          );
        } else {
          Alert.alert("Sukses", "Nominal berhasil ditambahkan");
          fetchTabungan();
        }
      }
    } catch (error) {
      console.error("Error tambah nominal:", error);
      Alert.alert(
        "Error",
        "Gagal menambah nominal. Periksa:\n• Koneksi internet\n• Server aktif\n• IP address server"
      );
=======
        
        // Trigger animasi reward
        await triggerRewardAnimation(isCompleted, previousPoin, previousMedali);
        
        // Refresh data
        fetchTabungan();
        fetchRewardData();
      }
    } catch (error) {
      console.error("Error tambah nominal:", error);
      Alert.alert("Error", "Gagal menambah nominal.");
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/LihatTabunganScreen.jsx
    }
  };

  // Fungsi untuk trigger animasi reward
  const triggerRewardAnimation = async (isTargetCompleted, previousPoin, previousMedali) => {
    try {
      // Fetch data reward terbaru
      const token = await AsyncStorage.getItem("jwtToken");
      const rewardResponse = await axios.get(
        `${BASE_URL}/reward-gamification/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (rewardResponse.data && rewardResponse.data.code === 200) {
        const currentReward = rewardResponse.data.data;
        const updatedPoin = currentReward.poin || 0;
        const updatedMedali = currentReward.medali || 0;

        // Cek apakah dapat medali baru (poin mencapai kelipatan 300)
        const gotNewMedal = Math.floor(updatedPoin / 300) > Math.floor(previousPoin / 300);
        
        if (gotNewMedal) {
          // Animasi medali
          setRewardType('medal');
          setRewardMessage(`Selamat! Kamu dapat medali baru! 🏅\nTotal ${updatedMedali} medali terkumpul!\nTeruskan perjalanan menabungmu!`);
          setShowRewardAnimation(true);
        } else if (isTargetCompleted) {
          // Animasi target selesai + poin
          setRewardType('poin');
          setRewardMessage(`Luar biasa! Target "${selectedTabungan.namaTarget}" berhasil tercapai! 🎊\nKamu dapat 30 poin!`);
          setShowRewardAnimation(true);
        } else {
          // Animasi poin biasa
          setRewardType('poin');
          setRewardMessage(`Yeay! Berhasil menabung ${formatCurrency(parseFloat(nominalInput.replace(/\./g, "")))}! 💰\nKamu dapat 30 poin!`);
          setShowRewardAnimation(true);
        }
      }
    } catch (error) {
      console.error("Error checking reward:", error);
      // Fallback animation
      setRewardType('poin');
      setRewardMessage(`Berhasil menabung! 🎉\nKamu dapat 30 poin!`);
      setShowRewardAnimation(true);
    }
  };

  // Handler ketika animasi selesai
  const handleAnimationComplete = () => {
    setShowRewardAnimation(false);
  };

  // Hapus tabungan
  const handleDelete = (id, nama) => {
<<<<<<< HEAD:src/screens/LihatTabunganScreen.jsx
    Alert.alert("Hapus Tabungan", `Yakin ingin menghapus "${nama}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await api.delete(`/target-tabungan/${id}`);

            if (response.data && response.data.code === 200) {
              Alert.alert("Sukses", "Tabungan berhasil dihapus");
              fetchTabungan();
=======
    Alert.alert(
      "Hapus Tabungan",
      `Yakin ingin menghapus "${nama}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${BASE_URL}/target-tabungan/${id}`
              );
              
              if (response.data && response.data.code === 200) {
                Alert.alert("Sukses", "Tabungan berhasil dihapus");
                fetchTabungan();
              }
            } catch (error) {
              console.error("Error delete:", error);
              Alert.alert("Error", "Gagal menghapus tabungan");
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/LihatTabunganScreen.jsx
            }
          } catch (error) {
            console.error("Error delete:", error);
            Alert.alert("Error", "Gagal menghapus tabungan");
          }
        },
      },
    ]);
  };

  // Komponen Progress Bar dengan Animasi
  const AnimatedProgressBar = ({ progress, isCompleted }) => {
    const [animatedProgress] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, [progress]);

    return (
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { 
              width: animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })
            },
            isCompleted && styles.progressBarCompleted
          ]} 
        />
      </View>
    );
  };

  // Render item tabungan
  const renderTabunganItem = ({ item }) => {
    const progress = calculateProgress(
      item.nominalSekarang,
      item.targetNominal
    );
    const isCompleted = item.status === "selesai";
    const sisaNominal = item.targetNominal - item.nominalSekarang;

    return (
      <View style={[styles.card, isCompleted && styles.cardCompleted]}>
        {/* Header Card dengan background pattern */}
        <View style={styles.cardHeaderPattern}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <MaterialIcons
                name="savings"
                size={28}
                color={isCompleted ? "#10B981" : "#FFFFFF"}
              />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.namaTarget}
              </Text>
            </View>

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.completedText}>Selesai 🎉</Text>
              </View>
            )}
          </View>
        </View>

        {/* Foto Tabungan (jika ada) */}
        {item.fotoTabungan && (
          <Image
            source={{ uri: item.fotoTabungan }}
            style={styles.tabunganImage}
            resizeMode="cover"
          />
        )}

        {/* Progress Bar dengan Persentase */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress Menabung</Text>
            <Text
              style={[
                styles.progressPercentage,
                isCompleted && styles.progressPercentageCompleted,
              ]}
            >
              {progress.toFixed(1)}%
            </Text>
          </View>
<<<<<<< HEAD:src/screens/LihatTabunganScreen.jsx
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%` },
                isCompleted && styles.progressBarCompleted,
              ]}
            />
          </View>
=======
          <AnimatedProgressBar progress={progress} isCompleted={isCompleted} />
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/LihatTabunganScreen.jsx
        </View>

        {/* Nominal Info */}
        <View style={styles.nominalSection}>
          <View style={styles.nominalBox}>
            <Text style={styles.labelText}>Terkumpul</Text>
            <Text style={[styles.nominalText, styles.nominalTerkumpul]}>
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

        {/* Sisa Nominal (jika belum selesai) */}
        {!isCompleted && (
          <View style={styles.sisaBox}>
            <Ionicons name="trending-up-outline" size={18} color="#F59E0B" />
            <Text style={styles.sisaText}>
              Sisa:{" "}
              <Text style={styles.sisaNominal}>
                {formatCurrency(sisaNominal)}
              </Text>
            </Text>
          </View>
        )}

        {/* Detail Info */}
        <View style={styles.detailSection}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#2691B5" />
            <Text style={styles.detailText}>
              {formatDate(item.tanggalMulai)} -{" "}
              {formatDate(item.tanggalSelesai)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="repeat-outline" size={16} color="#2691B5" />
            <Text style={styles.detailText}>
              {formatCurrency(item.nominalPengisian)} /{" "}
              {item.frekuensiPengisian}
            </Text>
          </View>
        </View>

        {/* Catatan (jika ada) */}
        {item.catatan && (
          <View style={styles.catatanBox}>
            <Ionicons name="document-text-outline" size={16} color="#2691B5" />
            <Text style={styles.catatanText} numberOfLines={2}>
              {item.catatan}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!isCompleted && (
            <TouchableOpacity
              style={styles.tambahBtn}
              onPress={() => openTambahModal(item)}
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Tambah Saldo 💰</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.deleteBtn, !isCompleted && styles.deleteBtnSmall]}
            onPress={() => handleDelete(item.idTarget, item.namaTarget)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !userId) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={styles.loadingText}>Memuat data pengguna...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={styles.loadingText}>Memuat data tabungan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Custom */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tabungan Saya 💰</Text>
        <Text style={styles.headerSubtitle}>Ayo capai target menabungmu!</Text>
        <Text style={styles.userInfoText}></Text>
      </View>

      {/* Animasi Reward */}
      <RewardAnimation
        type={rewardType}
        isVisible={showRewardAnimation}
        onComplete={handleAnimationComplete}
        message={rewardMessage}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "semua" && styles.filterTabActive,
          ]}
          onPress={() => setFilter("semua")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "semua" && styles.filterTextActive,
            ]}
          >
            Semua ({tabunganList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "selesai" && styles.filterTabActive,
          ]}
          onPress={() => setFilter("selesai")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "selesai" && styles.filterTextActive,
            ]}
          >
            Selesai ({tabunganList.filter((t) => t.status === "selesai").length}
            )
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Tabungan */}
      <FlatList
        data={getFilteredData()}
        renderItem={renderTabunganItem}
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
            <MaterialIcons name="savings" size={100} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              {filter === "selesai"
                ? "Belum ada tabungan yang selesai"
                : "Belum ada tabungan nih! 🐷"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === "semua"
                ? "Yuk mulai menabung untuk mencapai impianmu!"
                : "Ayo selesaikan tabungan yang sedang berjalan!"}
            </Text>
            {filter === "semua" && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("TabunganScreen")}
              >
                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Buat Tabungan Baru ✨</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Floating Action Button */}
      {tabunganList.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("TabunganScreen")}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal Tambah Nominal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Saldo 💰</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#2691B5" />
              </TouchableOpacity>
            </View>

            {selectedTabungan && (
              <>
                <Text style={styles.modalTabunganName}>
                  {selectedTabungan.namaTarget}
                </Text>

                <View style={styles.modalInfoBox}>
                  <Text style={styles.modalInfoLabel}>Saldo Saat Ini</Text>
                  <Text style={styles.modalInfoValue}>
                    {formatCurrency(selectedTabungan.nominalSekarang)}
                  </Text>
                </View>

                <View style={styles.modalInfoBox}>
                  <Text style={styles.modalInfoLabel}>Target</Text>
                  <Text style={styles.modalInfoValue}>
                    {formatCurrency(selectedTabungan.targetNominal)}
                  </Text>
                </View>

                {/* Info Reward */}
                <View style={styles.rewardInfoBox}>
                  <Ionicons name="gift-outline" size={20} color="#F59E0B" />
                  <Text style={styles.rewardInfoText}>
                    Dapatkan <Text style={styles.rewardHighlight}>30 poin</Text> setiap menabung!
                  </Text>
                </View>

                <View style={styles.modalInputWrapper}>
                  <Text style={styles.modalInputLabel}>Nominal Tambahan</Text>
                  <View style={styles.modalInput}>
                    <Text style={styles.modalInputPrefix}>Rp</Text>
                    <TextInput
                      style={styles.modalInputField}
                      placeholder="0"
                      keyboardType="numeric"
                      value={nominalInput}
                      onChangeText={(text) =>
                        setNominalInput(formatInputCurrency(text))
                      }
                      autoFocus
                    />
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSaveBtn}
                    onPress={handleTambahNominal}
                  >
                    <Ionicons name="add-circle" size={20} color="#fff" />
                    <Text style={styles.modalSaveText}>Tambah Saldo 💸</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#2691B5",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#E0F2FE",
  },
  userInfoText: {
    fontSize: 12,
    color: "#E0F2FE",
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -15,
    padding: 8,
    borderRadius: 15,
    gap: 8,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#2691B5",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
  },
  cardCompleted: {
    borderWidth: 3,
    borderColor: "transparent",
  },
  cardHeaderPattern: {
    backgroundColor: "#2691B5",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    color: "#FFFFFF",
    flex: 1,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#10B981",
  },
  tabunganImage: {
    width: "100%",
    height: 160,
    marginBottom: 16,
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
  progressPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2691B5",
  },
  progressPercentageCompleted: {
    color: "#10B981",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2691B5",
    borderRadius: 10,
  },
  progressBarCompleted: {
    backgroundColor: "#10B981",
  },
  nominalSection: {
    flexDirection: "row",
    backgroundColor: "#F0F9FF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E0F2FE",
  },
  nominalBox: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 2,
    backgroundColor: "#BAE6FD",
    marginHorizontal: 16,
  },
  labelText: {
    fontSize: 12,
    color: "#2691B5",
    marginBottom: 6,
    fontWeight: "500",
  },
  nominalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  nominalTerkumpul: {
    color: "#2691B5",
  },
  sisaBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF7CD",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  sisaText: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500",
  },
  sisaNominal: {
    fontWeight: "bold",
    color: "#F59E0B",
  },
  detailSection: {
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#2691B5",
    fontWeight: "500",
  },
  catatanBox: {
    flexDirection: "row",
    backgroundColor: "#E0F2FE",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#BAE6FD",
  },
  catatanText: {
    flex: 1,
    fontSize: 13,
    color: "#0369A1",
    lineHeight: 18,
    fontWeight: "400",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tambahBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2691B5",
    paddingVertical: 14,
    borderRadius: 15,
    gap: 8,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 15,
    gap: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteBtnSmall: {
    flex: 0.5,
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2691B5",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2691B5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(38, 145, 181, 0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2691B5",
  },
  modalTabunganName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2691B5",
    marginBottom: 20,
    textAlign: "center",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0F2FE",
  },
  modalInfoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E0F2FE",
  },
  modalInfoLabel: {
    fontSize: 14,
    color: "#2691B5",
    fontWeight: "500",
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  rewardInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FDE68A',
    gap: 8,
  },
  rewardInfoText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  rewardHighlight: {
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  modalInputWrapper: {
    marginTop: 20,
    marginBottom: 25,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2691B5",
    marginBottom: 10,
  },
  modalInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderWidth: 3,
    borderColor: "#2691B5",
    borderRadius: 15,
    paddingHorizontal: 16,
  },
  modalInputPrefix: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2691B5",
    marginRight: 10,
  },
  modalInputField: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    paddingVertical: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#64748B",
  },
  modalSaveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: "#2691B5",
    alignItems: "center",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
