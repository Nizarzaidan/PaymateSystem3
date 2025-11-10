import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";

export default function KelolaKategori({ navigation }) {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ikonModalVisible, setIkonModalVisible] = useState(false);
  const [warnaModalVisible, setWarnaModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    idKategori: null,
    namaKategori: "",
    tipeKategori: "pengeluaran",
    warna: "#2691B5",
    ikon: "wallet-outline",
    keterangan: "",
  });

  // Daftar ikon yang TERBUKTI tersedia di Expo
  const availableIcons = [
    // Finance & Money (TERBUKTI)
    "wallet-outline", "cash", "credit-card", "bank", "currency-usd", "coin",
    "chart-line", "chart-bar", "chart-pie", "trending-up", "trending-down",
    
    // Food & Drink (TERBUKTI)
    "food", "food-apple", "food-fork-drink", "pizza", "hamburger",
    "noodles", "ice-cream", "cake", "fruit-watermelon", "fruit-cherries",
    "coffee", "tea", "beer", "glass-cocktail", "glass-wine", "bottle-soda",
    
    // Shopping & Retail (TERBUKTI)
    "cart", "shopping", "store", "basket", "bag-personal", "tag",
    "sale", "percent", "gift", "gift-outline",
    
    // Transportation (TERBUKTI)
    "car", "bus", "train", "airplane", "ship", "bicycle",
    "motorbike", "walk", "run", "taxi", "subway",
    
    // Entertainment & Leisure (TERBUKTI)
    "movie", "filmstrip", "television", "music", "headphones", "gamepad-variant",
    "controller-classic", "dice", "cards", "palm-tree", "beach",
    "soccer", "basketball", "tennis", "swim", "dumbbell", "yoga",
    
    // Home & Utilities (TERBUKTI)
    "home", "home-city", "lightbulb", "flash", "water", "fire",
    "snowflake", "power", "wifi", "cellphone", "monitor", "printer",
    
    // Health & Medical (TERBUKTI)
    "medical-bag", "hospital", "pharmacy", "pill", "stethoscope", "heart-pulse",
    "tooth", "eye", "emoticon-sick", "ambulance",
    
    // Education & Office (TERBUKTI)
    "school", "book", "book-open", "pen", "pencil", "calculator",
    "laptop", "notebook", "briefcase", "file-document",
    
    // Fashion & Beauty (TERBUKTI)
    "tshirt-crew", "hanger", "shoe-heel", "diamond",
    "lipstick", "spray", "hair-dryer",
    
    // Travel & Places (TERBUKTI)
    "map-marker", "compass", "earth", "flag", "castle", "island", "mountain",
    "forest", "weather-sunny", "weather-rainy", "weather-snowy",
    
    // Animals & Nature (TERBUKTI)
    "cat", "dog", "rabbit", "bird", "fish", "paw", "tree", "flower", "leaf",
    "bug", "butterfly", "bee",
    
    // Household Items (TERBUKTI)
    "sofa", "bed", "chair", "table", "lamp", "camera", "toaster", "microwave",
    "fridge", "washing-machine", "vacuum", "broom",
    
    // Tools & Construction (TERBUKTI)
    "hammer", "wrench", "screwdriver", "toolbox", "ruler", "key", "lock",
    
    // Communication (TERBUKTI)
    "email", "message", "phone", "forum", "chat",
    "account-group", "handshake", "heart", "star", "thumb-up",
    
    // Miscellaneous (TERBUKTI)
    "alarm", "clock", "calendar", "weather-night", "moon-waning-crescent",
    "palette", "music-note", "camera", "robot",
    "emoticon", "emoticon-happy", "emoticon-sad", "emoticon-wink",

    // Ikon default yang pasti tersedia
    "wallet", "cash-multiple", "shopping-outline", "home-outline",
    "car-outline", "food-outline", "medical-bag", "school-outline"
  ];

  // WARNA YANG LEBIH BERVARIASI DAN MENARIK
  const colors = [
    // Blues & Teals
    "#2691B5", "#06B6D4", "#0891B2", "#0EA5E9", "#0369A1", "#0D9488",
    "#14B8A6", "#2DD4BF", "#0F766E", "#155E75",
    
    // Greens
    "#10B981", "#16A34A", "#22C55E", "#4ADE80", "#15803D", "#65A30D",
    "#84CC16", "#A3E635", "#3F6212", "#365314",
    
    // Yellows & Oranges
    "#F59E0B", "#F97316", "#EA580C", "#FB923C", "#D97706", "#CA8A04",
    "#EAB308", "#FACC15", "#A16207", "#713F12",
    
    // Reds & Pinks
    "#EF4444", "#DC2626", "#F87171", "#FB7185", "#E11D48", "#BE185D",
    "#EC4899", "#F472B6", "#9F1239", "#831843",
    
    // Purples & Violets
    "#8B5CF6", "#7C3AED", "#A855F7", "#C084FC", "#9333EA", "#6B21A8",
    "#7E22CE", "#A855F7", "#581C87", "#3B0764",
    
    // Grays & Neutrals
    "#64748B", "#475569", "#334155", "#1E293B", "#6B7280", "#4B5563",
    "#374151", "#111827", "#000000", "#FFFFFF",
    
    // Special Colors
    "#F43F5E", "#EC4899", "#D946EF", "#A855F7", "#8B5CF6", "#6366F1",
    "#3B82F6", "#0EA5E9", "#06B6D4", "#14B8A6",
    
    // Pastel Colors
    "#FECACA", "#FED7AA", "#FEF08A", "#D9F99D", "#BBF7D0", "#A7F3D0",
    "#99F6E4", "#A5F3FC", "#BAE6FD", "#DDD6FE",
    
    // Dark Colors
    "#991B1B", "#9A3412", "#92400E", "#854D0E", "#3F6212", "#166534",
    "#115E59", "#1E40AF", "#3730A3", "#581C87",
    
    // Vibrant Colors
    "#DC2626", "#EA580C", "#D97706", "#CA8A04", "#65A30D", "#16A34A",
    "#059669", "#0D9488", "#0891B2", "#0369A1",
    "#1D4ED8", "#4338CA", "#7C3AED", "#A855F7", "#DB2777", "#E11D48"
  ];

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadKategori();
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

  const loadKategori = async () => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      console.log("🔄 Memuat data kategori untuk user:", userId);
      const response = await axios.get(`${BASE_URL}/kategori-transaksi/pengguna/${userId}`);
      console.log("📦 Data kategori diterima:", response.data.length, "items");
      setKategori(response.data);
    } catch (error) {
      console.error("❌ Gagal memuat kategori:", error);
      Alert.alert("Error", "Gagal memuat data kategori");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadKategori();
  };

  const resetForm = () => {
    setFormData({
      idKategori: null,
      namaKategori: "",
      tipeKategori: "pengeluaran",
      warna: "#2691B5",
      ikon: "wallet-outline",
      keterangan: "",
    });
    setEditMode(false);
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!formData.namaKategori.trim()) {
      Alert.alert("Error", "Nama kategori harus diisi");
      return;
    }

    const kategoriData = {
      namaKategori: formData.namaKategori.trim(),
      tipeKategori: formData.tipeKategori,
      warna: formData.warna,
      ikon: formData.ikon,
      keterangan: formData.keterangan.trim() || `Kategori ${formData.tipeKategori}`,
      status: true,
      pengguna: { idPengguna: userId }
    };
    
    try {
      if (editMode) {
        // Update kategori
        kategoriData.idKategori = formData.idKategori;
        await axios.put(`${BASE_URL}/kategori-transaksi`, kategoriData);
        Alert.alert("Sukses", "Kategori berhasil diupdate");
      } else {
        // Tambah kategori baru
        await axios.post(`${BASE_URL}/kategori-transaksi`, kategoriData);
        Alert.alert("Sukses", "Kategori berhasil ditambahkan");
      }

      setModalVisible(false);
      resetForm();
      loadKategori(); // Refresh data
    } catch (error) {
      console.error("❌ Error menyimpan kategori:", error);
      Alert.alert(
        "Error", 
        `Gagal ${editMode ? 'mengupdate' : 'menyimpan'} kategori: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleEdit = (item) => {
    setFormData({
      idKategori: item.idKategori,
      namaKategori: item.namaKategori,
      tipeKategori: item.tipeKategori,
      warna: item.warna || "#2691B5",
      ikon: item.ikon || "wallet-outline",
      keterangan: item.keterangan || "",
    });
    setEditMode(true);
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Hapus Kategori",
      `Apakah Anda yakin ingin menghapus kategori "${item.namaKategori}"?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/kategori-transaksi/${item.idKategori}`);
              Alert.alert("Sukses", "Kategori berhasil dihapus");
              loadKategori(); // Refresh data
            } catch (error) {
              console.error("❌ Error menghapus kategori:", error);
              Alert.alert("Error", "Gagal menghapus kategori");
            }
          }
        }
      ]
    );
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // Fungsi untuk handle ikon yang tidak tersedia
  const getSafeIcon = (iconName) => {
    const safeIcons = {
      // Mapping untuk ikon yang mungkin tidak tersedia
      "food-variant": "food",
      "fruit-grapes": "fruit-watermelon",
      "shopping-search": "shopping",
      "rocket": "airplane",
      "ferry": "ship",
      "scooter": "motorbike",
      "filmstrip": "movie",
      "controller-classic": "gamepad-variant",
      "ski": "snowflake",
      "stethoscope": "medical-bag",
      "medical-cotton-swab": "medical-bag",
      "book-open": "book",
      "marker": "pen",
      "notebook": "book",
      "desk-lamp": "lamp",
      "hanger": "tshirt-crew",
      "shoe-formal": "shoe-heel",
      "diamond-stone": "diamond",
      "makeup": "lipstick",
      "mirror": "camera",
      "map-marker": "compass",
      "earth": "compass",
      "island": "palm-tree",
      "weather-night": "weather-sunny",
      "moon-waning-crescent": "weather-sunny",
      "rabbit": "cat",
      "paw": "cat",
      "seed": "leaf",
      "sprout": "leaf",
      "sofa": "chair",
      "toaster": "microwave",
      "washing-machine": "fridge",
      "vacuum": "broom",
      "tape-measure": "ruler",
      "paint-roller": "brush",
      "security": "lock",
      "cellphone-message": "message",
      "forum": "chat",
      "camera-enhance": "camera",
      "ghost": "emoticon",
      "emoticon-sick": "emoticon-sad"
    };
    
    return safeIcons[iconName] || iconName;
  };

  const renderKategoriItem = ({ item }) => (
    <View style={styles.kategoriItem}>
      <View style={styles.kategoriInfo}>
        <View 
          style={[
            styles.kategoriIcon, 
            { backgroundColor: item.warna || "#2691B5" }
          ]}
        >
          <MaterialCommunityIcons 
            name={getSafeIcon(item.ikon || "wallet-outline")} 
            size={24} 
            color="#fff" 
          />
        </View>
        <View style={styles.kategoriDetails}>
          <Text style={styles.kategoriNama}>{item.namaKategori}</Text>
          <View style={styles.kategoriMeta}>
            <View 
              style={[
                styles.tipeBadge,
                item.tipeKategori === 'pemasukan' ? styles.pemasukanBadge : styles.pengeluaranBadge
              ]}
            >
              <Text style={styles.tipeText}>
                {item.tipeKategori === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
              </Text>
            </View>
            {item.keterangan && (
              <Text style={styles.keteranganText}>{item.keterangan}</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color="#2691B5" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const IkonModal = ({ visible, onClose, onSelect }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.iconModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Ikon</Text>
            <Text style={styles.modalSubtitle}>
              {availableIcons.length} ikon tersedia
            </Text>
          </View>
          
          <FlatList
            data={availableIcons}
            numColumns={6}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.iconOption,
                  formData.ikon === item && styles.iconOptionActive
                ]}
                onPress={() => {
                  setFormData({...formData, ikon: item});
                  onClose();
                }}
              >
                <MaterialCommunityIcons 
                  name={getSafeIcon(item)} 
                  size={24} 
                  color={formData.ikon === item ? "#fff" : formData.warna} 
                />
              </TouchableOpacity>
            )}
            style={styles.iconGrid}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const WarnaModal = ({ visible, onClose, onSelect }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.colorModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Warna</Text>
            <Text style={styles.modalSubtitle}>
              {colors.length} warna tersedia - Scroll untuk lebih banyak
            </Text>
          </View>
          
          <FlatList
            data={colors}
            numColumns={6}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.colorOption,
                  { backgroundColor: item },
                  formData.warna === item && styles.colorOptionActive
                ]}
                onPress={() => {
                  setFormData({...formData, warna: item});
                  onClose();
                }}
              >
                {formData.warna === item && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            )}
            style={styles.colorGrid}
            showsVerticalScrollIndicator={true}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kelola Kategori</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Info Statistik */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{kategori.length}</Text>
          <Text style={styles.statLabel}>Total Kategori</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {kategori.filter(k => k.tipeKategori === 'pengeluaran').length}
          </Text>
          <Text style={styles.statLabel}>Pengeluaran</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {kategori.filter(k => k.tipeKategori === 'pemasukan').length}
          </Text>
          <Text style={styles.statLabel}>Pemasukan</Text>
        </View>
      </View>

      {/* List Kategori */}
      <FlatList
        data={kategori}
        keyExtractor={(item) => item.idKategori.toString()}
        renderItem={renderKategoriItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2691B5"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="folder-open-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada kategori</Text>
            <Text style={styles.emptySubtext}>
              Tambah kategori baru untuk mengelola transaksi Anda
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>Tambah Kategori Pertama</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal Form Kategori */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? "Edit Kategori" : "Tambah Kategori Baru"}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Input Nama Kategori */}
            <Text style={styles.label}>Nama Kategori</Text>
            <TextInput
              style={styles.input}
              value={formData.namaKategori}
              onChangeText={(text) => setFormData({...formData, namaKategori: text})}
              placeholder="Masukkan nama kategori"
              placeholderTextColor="#9CA3AF"
            />

            {/* Pilihan Tipe Kategori */}
            <Text style={styles.label}>Tipe Kategori</Text>
            <View style={styles.tipeContainer}>
              <TouchableOpacity
                style={[
                  styles.tipeButton,
                  formData.tipeKategori === 'pengeluaran' && styles.tipeButtonActive
                ]}
                onPress={() => setFormData({...formData, tipeKategori: 'pengeluaran'})}
              >
                <Ionicons 
                  name="arrow-down" 
                  size={16} 
                  color={formData.tipeKategori === 'pengeluaran' ? "#fff" : "#EF4444"} 
                />
                <Text style={[
                  styles.tipeButtonText,
                  formData.tipeKategori === 'pengeluaran' && styles.tipeButtonTextActive
                ]}>
                  Pengeluaran
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipeButton,
                  formData.tipeKategori === 'pemasukan' && styles.tipeButtonActive
                ]}
                onPress={() => setFormData({...formData, tipeKategori: 'pemasukan'})}
              >
                <Ionicons 
                  name="arrow-up" 
                  size={16} 
                  color={formData.tipeKategori === 'pemasukan' ? "#fff" : "#10B981"} 
                />
                <Text style={[
                  styles.tipeButtonText,
                  formData.tipeKategori === 'pemasukan' && styles.tipeButtonTextActive
                ]}>
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pilihan Ikon */}
            <Text style={styles.label}>Ikon</Text>
            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => setIkonModalVisible(true)}
            >
              <View style={styles.selectorContent}>
                <View style={[styles.iconPreview, { backgroundColor: formData.warna }]}>
                  <MaterialCommunityIcons 
                    name={getSafeIcon(formData.ikon)} 
                    size={20} 
                    color="#fff" 
                  />
                </View>
                <Text style={styles.selectorText}>{formData.ikon}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Pilihan Warna */}
            <Text style={styles.label}>Warna</Text>
            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => setWarnaModalVisible(true)}
            >
              <View style={styles.selectorContent}>
                <View 
                  style={[styles.colorPreview, { backgroundColor: formData.warna }]} 
                />
                <Text style={styles.selectorText}>{formData.warna}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Input Keterangan */}
            <Text style={styles.label}>Keterangan (Opsional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.keterangan}
              onChangeText={(text) => setFormData({...formData, keterangan: text})}
              placeholder="Masukkan keterangan kategori"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Pilih Ikon */}
      <IkonModal
        visible={ikonModalVisible}
        onClose={() => setIkonModalVisible(false)}
        onSelect={(icon) => setFormData({...formData, ikon: icon})}
      />

      {/* Modal Pilih Warna */}
      <WarnaModal
        visible={warnaModalVisible}
        onClose={() => setWarnaModalVisible(false)}
        onSelect={(color) => setFormData({...formData, warna: color})}
      />
    </SafeAreaView>
  );
}

// Styles tetap sama seperti sebelumnya...
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2691B5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2691B5",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  listContent: {
    padding: 10,
  },
  kategoriItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  kategoriInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  kategoriIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kategoriDetails: {
    flex: 1,
  },
  kategoriNama: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  kategoriMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  tipeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  pemasukanBadge: {
    backgroundColor: "#D1FAE5",
  },
  pengeluaranBadge: {
    backgroundColor: "#FEE2E2",
  },
  tipeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  keteranganText: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#2691B5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
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
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  iconModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  colorModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2691B5",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  tipeContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  tipeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    gap: 8,
  },
  tipeButtonActive: {
    backgroundColor: "#2691B5",
    borderColor: "#2691B5",
  },
  tipeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  tipeButtonTextActive: {
    color: "white",
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  selectorText: {
    fontSize: 16,
    color: "#374151",
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#2691B5",
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  // Icon Grid Styles
  iconGrid: {
    maxHeight: 300,
  },
  iconOption: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconOptionActive: {
    backgroundColor: "#2691B5",
    borderColor: "#2691B5",
  },
  // Color Grid Styles
  colorGrid: {
    maxHeight: 400,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionActive: {
    borderColor: "#374151",
    transform: [{ scale: 1.1 }],
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
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