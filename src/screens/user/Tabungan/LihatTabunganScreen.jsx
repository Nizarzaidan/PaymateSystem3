import React, { useState, useEffect, useRef } from "react";
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
import { BASE_URL } from "../../../api/apiClient";
import { RewardAnimation } from "../../../components/RewardAnimation";
import { useTabungan } from "../../../contexts/TabunganContext";
import { useFocusEffect } from "@react-navigation/native";

export default function LihatTabunganScreen({ navigation }) {
  const { 
    tabunganList, 
    loading, 
    userId,
    initializeUser,
    fetchTabungan,
    addNominalToTabungan,
    softDeleteTabungan,
    calculateProgress,
    isTargetCompleted
  } = useTabungan();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("semua");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTabungan, setSelectedTabungan] = useState(null);
  const [nominalInput, setNominalInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Reward states
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardType, setRewardType] = useState('poin');
  const [rewardMessage, setRewardMessage] = useState('');
  const [currentPoin, setCurrentPoin] = useState(0);
  const [currentMedali, setCurrentMedali] = useState(0);

  // Track which targets have already shown reward (prevent double popup)
  const rewardShownRef = useRef(new Set());

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!userId) {
        await initializeUser();
      }
    };
    init();
  }, []);

  // Fetch data when screen focused
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchTabungan();
        fetchRewardData();
      }
    }, [userId])
  );

  // Fetch reward data
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
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTabungan();
      await fetchRewardData();
    } finally {
      setRefreshing(false);
    }
  };

  // Sort data - data baru di atas berdasarkan tanggal dibuat
  const getSortedData = () => {
    return [...tabunganList].sort((a, b) => {
      return new Date(b.tanggalDibuat || b.tanggalMulai) - new Date(a.tanggalDibuat || a.tanggalMulai);
    });
  };

  // Filter and search data
  const getFilteredData = () => {
    let data = getSortedData();

    // Apply filter
    if (filter === "selesai") {
      data = data.filter((item) => item.status === "selesai");
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      data = data.filter((item) => 
        item.namaTarget.toLowerCase().includes(query) ||
        (item.catatan && item.catatan.toLowerCase().includes(query))
      );
    }

    return data;
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

  // Format input currency
  const formatInputCurrency = (value) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Parse currency input to number
  const parseCurrencyInput = (value) => {
    return parseInt(value.replace(/\./g, "")) || 0;
  };

  // Calculate maximum allowed nominal
  const calculateMaxNominal = (tabungan) => {
    if (!tabungan) return 0;
    const sisa = tabungan.targetNominal - tabungan.nominalSekarang;
    return Math.max(0, sisa);
  };

  // Validate nominal input
  const validateNominalInput = (input, tabungan) => {
    if (!input || input === "0") {
      return { isValid: false, message: "Masukkan nominal yang valid" };
    }

    const nominal = parseCurrencyInput(input);
    
    if (isNaN(nominal) || nominal <= 0) {
      return { isValid: false, message: "Nominal harus lebih dari 0" };
    }

    // Check if exceeds target
    const maxAllowed = calculateMaxNominal(tabungan);
    if (nominal > maxAllowed) {
      return { 
        isValid: false, 
        message: `Nominal melebihi target!\n\nMaksimal yang bisa ditambahkan: ${formatCurrency(maxAllowed)}` 
      };
    }

    return { isValid: true, message: "" };
  };

  // Open modal
  const openTambahModal = (item) => {
    // Check if already completed (100%)
    if (isTargetCompleted(item)) {
      Alert.alert(
        "Target Sudah Selesai",
        "Tabungan ini sudah mencapai 100%. Tidak dapat menambah nominal lagi.",
        [{ text: "OK" }]
      );
      return;
    }

    setSelectedTabungan(item);
    setNominalInput("");
    setModalVisible(true);
  };

  // Handle input change with validation
  const handleInputChange = (text) => {
    const formattedText = formatInputCurrency(text);
    setNominalInput(formattedText);

    // Real-time validation feedback
    if (selectedTabungan && formattedText) {
      const validation = validateNominalInput(formattedText, selectedTabungan);
      if (!validation.isValid) {
        // You can add visual feedback here if needed
      }
    }
  };

  // Add nominal with ONE-TIME reward validation
  const handleTambahNominal = async () => {
    if (!selectedTabungan) return;

    const validation = validateNominalInput(nominalInput, selectedTabungan);
    if (!validation.isValid) {
      Alert.alert("Error", validation.message);
      return;
    }

    const nominal = parseCurrencyInput(nominalInput);
    
    try {
      // Check if target will be completed after adding
      const newNominal = selectedTabungan.nominalSekarang + nominal;
      const willBeCompleted = newNominal >= selectedTabungan.targetNominal;
      const wasAlreadyCompleted = isTargetCompleted(selectedTabungan);

      // Check if reward already shown for this target
      const rewardKey = `${selectedTabungan.idTarget}`;
      const rewardAlreadyShown = rewardShownRef.current.has(rewardKey);

      // Save previous reward state
      const previousPoin = currentPoin;

      // API call
      const response = await axios.put(
        `${BASE_URL}/target-tabungan/${selectedTabungan.idTarget}/tambah?nominal=${nominal}`
      );

      if (response.data && response.data.code === 200) {
        // Update local state (real-time)
        addNominalToTabungan(selectedTabungan.idTarget, nominal);
        
        setModalVisible(false);

        // Show reward ONLY if:
        // 1. Target just reached 100% (willBeCompleted && !wasAlreadyCompleted)
        // 2. Reward hasn't been shown before for this target (!rewardAlreadyShown)
        if (willBeCompleted && !wasAlreadyCompleted && !rewardAlreadyShown) {
          // Mark reward as shown for this target
          rewardShownRef.current.add(rewardKey);

          // Trigger reward animation
          await triggerRewardAnimation(true, previousPoin);
          
          Alert.alert(
            "🎉 Selamat!",
            `Target "${selectedTabungan.namaTarget}" berhasil tercapai 100%!\n\nKamu mendapatkan 30 poin! 🎯`,
            [{ 
              text: "Lanjutkan", 
              onPress: () => {
                fetchTabungan();
                fetchRewardData();
              }
            }]
          );
        } else {
          // Normal success message (no reward)
          const progressPercent = ((newNominal / selectedTabungan.targetNominal) * 100).toFixed(1);
          Alert.alert(
            "✅ Berhasil!",
            `Berhasil menabung ${formatCurrency(nominal)}!\n\nProgress: ${progressPercent}%\n\nLanjutkan menabung untuk mencapai target 100%! 💪`,
            [{ 
              text: "OK",
              onPress: () => {
                fetchTabungan();
                fetchRewardData();
              }
            }]
          );
        }
      }
    } catch (error) {
      console.error("Error tambah nominal:", error);
      Alert.alert("Error", "Gagal menambah nominal.");
    }
  };

  // Trigger reward animation
  const triggerRewardAnimation = async (isTargetCompleted, previousPoin) => {
    if (!isTargetCompleted) return;

    try {
      // Fetch updated reward data
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

        // Check if got new medal (poin reached multiple of 300)
        const gotNewMedal = Math.floor(updatedPoin / 300) > Math.floor(previousPoin / 300);
        
        if (gotNewMedal) {
          // Medal + points animation
          setRewardType('medal');
          setRewardMessage(`🏅 Target "${selectedTabungan.namaTarget}" selesai!\n\n+30 poin + Medali baru!\nTotal ${updatedMedali} medali terkumpul! 🎊`);
        } else {
          // Points only animation
          setRewardType('poin');
          setRewardMessage(`🎯 Target "${selectedTabungan.namaTarget}" selesai!\n\n+30 poin! Luar biasa! 🎊`);
        }
        
        setShowRewardAnimation(true);
      }
    } catch (error) {
      console.error("Error checking reward:", error);
      // Fallback animation
      setRewardType('poin');
      setRewardMessage(`🎯 Target "${selectedTabungan.namaTarget}" selesai!\n\n+30 poin! 🎊`);
      setShowRewardAnimation(true);
    }
  };

  // Handle animation complete
  const handleAnimationComplete = () => {
    setShowRewardAnimation(false);
  };

  // Delete tabungan (soft delete with real-time update)
  const handleDelete = (id, nama, tabungan) => {
    // Prevent delete if target is 100% completed
    if (isTargetCompleted(tabungan)) {
      Alert.alert(
        "Tidak Dapat Dihapus",
        `Tabungan "${nama}" sudah mencapai 100% dan tidak dapat dihapus.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Hapus Tabungan",
      `Yakin ingin menghapus "${nama}"?\n\nTabungan akan dipindahkan ke Sampah.`,
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
                // Real-time update
                softDeleteTabungan(id);
                Alert.alert("Sukses", "Tabungan berhasil dipindahkan ke sampah");
              }
            } catch (error) {
              console.error("Error delete:", error);
              Alert.alert("Error", "Gagal menghapus tabungan");
            }
          },
        },
      ]
    );
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Animated Progress Bar
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

  // Render item
  const renderTabunganItem = ({ item }) => {
    const progress = calculateProgress(item.nominalSekarang, item.targetNominal);
    const isCompleted = isTargetCompleted(item);
    const sisaNominal = item.targetNominal - item.nominalSekarang;

    return (
      <View style={[styles.card, isCompleted && styles.cardCompleted]}>
        {/* Header */}
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
                <Text style={styles.completedText}>✅ Target Selesai</Text>
              </View>
            )}
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

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress Menabung</Text>
            <Text style={[
              styles.progressPercentage,
              isCompleted && styles.progressPercentageCompleted
            ]}>
              {progress.toFixed(1)}%
            </Text>
          </View>
          <AnimatedProgressBar progress={progress} isCompleted={isCompleted} />
        </View>

        {/* Nominal */}
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

        {/* Sisa Nominal */}
        {!isCompleted && sisaNominal > 0 && (
          <View style={styles.sisaBox}>
            <Ionicons name="trending-up-outline" size={18} color="#F59E0B" />
            <Text style={styles.sisaText}>
              Sisa: <Text style={styles.sisaNominal}>{formatCurrency(sisaNominal)}</Text>
            </Text>
          </View>
        )}

        {/* Detail Info */}
        <View style={styles.detailSection}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#2691B5" />
            <Text style={styles.detailText}>
              {formatDate(item.tanggalMulai)} - {formatDate(item.tanggalSelesai)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="repeat-outline" size={16} color="#2691B5" />
            <Text style={styles.detailText}>
              {formatCurrency(item.nominalPengisian)} / {item.frekuensiPengisian}
            </Text>
          </View>
        </View>

        {/* Catatan */}
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
            style={[
              styles.editBtn, 
              !isCompleted && styles.editBtnSmall,
              isCompleted && styles.editBtnDisabled
            ]}
            onPress={() => {
              if (isCompleted) {
                Alert.alert(
                  "Tidak Dapat Diedit",
                  "Tabungan yang sudah mencapai 100% tidak dapat diedit.",
                  [{ text: "OK" }]
                );
              } else {
                navigation.navigate("EditTabunganScreen", { tabunganId: item.idTarget });
              }
            }}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteBtn, 
              !isCompleted && styles.deleteBtnSmaller,
              isCompleted && styles.deleteBtnDisabled
            ]}
            onPress={() => handleDelete(item.idTarget, item.namaTarget, item)}
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

  const filteredData = getFilteredData();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tabungan Saya 💰</Text>
          <Text style={styles.headerSubtitle}>Ayo capai target menabungmu!</Text>
        </View>
        
        <TouchableOpacity
          style={styles.sampahBtn}
          onPress={() => navigation.navigate("SampahTabunganScreen")}
        >
          <Ionicons name="trash-bin" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Reward Animation */}
      <RewardAnimation
        type={rewardType}
        isVisible={showRewardAnimation}
        onComplete={handleAnimationComplete}
        message={rewardMessage}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari tabungan..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter */}
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
            Selesai ({tabunganList.filter(t => t.status === "selesai").length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
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
              {searchQuery 
                ? `Tidak ditemukan tabungan "${searchQuery}"`
                : filter === "selesai" 
                  ? "Belum ada tabungan yang selesai" 
                  : "Belum ada tabungan nih! 🐷"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Coba gunakan kata kunci lain atau hapus pencarian"
                : filter === "semua" 
                  ? "Yuk mulai menabung untuk mencapai impianmu!" 
                  : "Ayo selesaikan tabungan yang sedang berjalan!"}
            </Text>
            {filter === "semua" && !searchQuery && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("TabunganScreen")}
              >
                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Buat Tabungan Baru ✨</Text>
              </TouchableOpacity>
            )}
            {searchQuery && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={clearSearch}
              >
                <Text style={styles.clearSearchText}>Hapus Pencarian</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB */}
      {tabunganList.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("TabunganScreen")}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal */}
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

                {/* Sisa yang bisa ditambahkan */}
                <View style={styles.sisaAllowedBox}>
                  <Ionicons name="alert-circle-outline" size={20} color="#2691B5" />
                  <Text style={styles.sisaAllowedText}>
                    Maksimal yang bisa ditambahkan:{" "}
                    <Text style={styles.sisaAllowedNominal}>
                      {formatCurrency(calculateMaxNominal(selectedTabungan))}
                    </Text>
                  </Text>
                </View>

                <View style={styles.rewardInfoBox}>
                  <Ionicons name="gift-outline" size={20} color="#F59E0B" />
                  <Text style={styles.rewardInfoText}>
                    Dapatkan <Text style={styles.rewardHighlight}>30 poin</Text> ketika target mencapai 100%! 🎯
                  </Text>
                </View>

                <View style={styles.modalInputWrapper}>
                  <Text style={styles.modalInputLabel}>Nominal Tambahan</Text>
                  <View style={[
                    styles.modalInput,
                    nominalInput && !validateNominalInput(nominalInput, selectedTabungan).isValid && 
                    styles.modalInputError
                  ]}>
                    <Text style={styles.modalInputPrefix}>Rp</Text>
                    <TextInput
                      style={styles.modalInputField}
                      placeholder="0"
                      keyboardType="numeric"
                      value={nominalInput}
                      onChangeText={handleInputChange}
                      autoFocus
                    />
                  </View>
                  
                  {/* Validation feedback */}
                  {nominalInput && !validateNominalInput(nominalInput, selectedTabungan).isValid && (
                    <Text style={styles.validationErrorText}>
                      {validateNominalInput(nominalInput, selectedTabungan).message}
                    </Text>
                  )}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalSaveBtn,
                      (!nominalInput || !validateNominalInput(nominalInput, selectedTabungan).isValid) && 
                      styles.modalSaveBtnDisabled
                    ]}
                    onPress={handleTambahNominal}
                    disabled={!nominalInput || !validateNominalInput(nominalInput, selectedTabungan).isValid}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  sampahBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 8,
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
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tambahBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2691B5",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    minHeight: 44,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    minHeight: 44,
    marginHorizontal: 4,
  },
  editBtnSmall: {
    flex: 1,
  },
  editBtnDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.6,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    minHeight: 44,
    marginHorizontal: 4,
  },
  deleteBtnSmaller: {
    flex: 1,
  },
  deleteBtnDisabled: {
    backgroundColor: "#CBD5E1",
    opacity: 0.6,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
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
  clearSearchButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
  },
  clearSearchText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
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
  sisaAllowedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    gap: 8,
  },
  sisaAllowedText: {
    fontSize: 14,
    color: '#0369A1',
    flex: 1,
  },
  sisaAllowedNominal: {
    fontWeight: 'bold',
    color: '#2691B5',
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
  modalInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
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
  validationErrorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
    textAlign: "center",
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
  modalSaveBtnDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.6,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});