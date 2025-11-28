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
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/apiClient";

export default function TagihanScreen({ navigation }) {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [overdueTagihan, setOverdueTagihan] = useState([]);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [userId, setUserId] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [notifScaleAnim] = useState(new Animated.Value(0));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getTagihan();
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) {
        getTagihan(selectedFilter === "Semua" ? "all" : selectedFilter);
      }
    });
    return unsubscribe;
  }, [navigation, userId, selectedFilter]);

  // Cek tagihan jatuh tempo saat data berubah
  useEffect(() => {
    if (tagihan.length > 0) {
      checkOverdueTagihan();
    }
  }, [tagihan]);

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

  // Filter data berdasarkan search query
  const getFilteredData = () => {
    let filteredData = tagihan;

    // Apply status filter
    if (selectedFilter === "Lunas") {
      filteredData = filteredData.filter(item => item.status === "Lunas");
    } else if (selectedFilter === "Belum Lunas") {
      filteredData = filteredData.filter(item => item.status === "Belum Lunas");
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredData = filteredData.filter(item => 
        item.namaTagihan.toLowerCase().includes(query) ||
        (item.catatan && item.catatan.toLowerCase().includes(query)) ||
        item.nominal.toString().includes(query)
      );
    }

    return filteredData;
  };

  const checkOverdueTagihan = async () => {
    try {
      const today_date = new Date();
      today_date.setHours(0, 0, 0, 0);
      
      const overdue = tagihan.filter(item => {
        if (item.status !== "Belum Lunas") return false;
        
        const dueDate = new Date(item.tanggalJatuhTempo);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate <= today_date;
      });

      if (overdue.length > 0) {
        // Cek apakah notifikasi untuk tagihan ini sudah ditampilkan hari ini
        const notificationKey = `notification_${new Date().toDateString()}`;
        const shownToday = await AsyncStorage.getItem(notificationKey);
        
        if (shownToday === "shown") {
          return; // Sudah tampil hari ini, jangan tampilkan lagi
        }

        setOverdueTagihan(overdue);
        setNotificationVisible(true);
        
        // Animasi shake untuk menarik perhatian
        Animated.sequence([
          Animated.spring(notifScaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // Simpan bahwa notifikasi sudah ditampilkan hari ini
        await AsyncStorage.setItem(notificationKey, "shown");
      }
    } catch (error) {
      console.error("Error checking overdue tagihan:", error);
    }
  };

  const hideNotification = () => {
    Animated.timing(notifScaleAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotificationVisible(false);
    });
  };

  const handlePayFromNotification = (item) => {
    hideNotification();
    setTimeout(() => {
      handleBayar(item.idTagihan);
    }, 300);
  };

  const formatNominal = (nominal) => {
    if (!nominal) return "0";
    return nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTipePerulangan = (tipe) => {
    if (!tipe) return "Tidak berulang";
    if (tipe === "tidak_berulang") return "Tidak berulang";
    return tipe.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const showDetailModal = (item) => {
    setSelectedTagihan(item);
    setDetailModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideDetailModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDetailModalVisible(false);
    });
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
        hideDetailModal();
      }
    } catch (error) {
      console.error("Gagal membayar tagihan:", error);
      Alert.alert("Gagal", "Tidak dapat membayar tagihan.");
    }
  };

  const handleEdit = (item) => {
    setActionModalVisible(false);
    hideDetailModal();
    setTimeout(() => {
      navigation.navigate("EditTagihanScreen", { tagihan: item });
    }, 100);
  };

  const handleDelete = (item) => {
    setActionModalVisible(false);
    Alert.alert(
      "Pindahkan ke Sampah?",
      `Tagihan "${item.namaTagihan}" akan dipindahkan ke sampah. Anda masih bisa memulihkannya nanti.`,
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Pindahkan",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete(`/tagihan/${item.idTagihan}`);
              if (response.status === 200) {
                Alert.alert("Sukses", "Tagihan dipindahkan ke sampah!");
                getTagihan(selectedFilter === "Semua" ? "all" : selectedFilter);
                hideDetailModal();
              }
            } catch (error) {
              console.error("Gagal menghapus tagihan:", error);
              Alert.alert("Gagal", "Tidak dapat memindahkan tagihan ke sampah.");
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

  const navigateToSampah = () => {
    navigation.navigate("SampahTagihanScreen");
  };

  const clearSearch = () => {
    setSearchQuery("");
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

  const filteredData = getFilteredData();

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => showDetailModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardLayout}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#FFFFFF" />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.namaTagihan}</Text>
          <Text style={styles.dateText}>{formatDate(item.tanggalJatuhTempo)}</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === "Lunas" ? "#00B050" : "#B71C1C" }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.amountText}>Rp {formatNominal(item.nominal)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => openActionModal(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#2691B5" />
        </TouchableOpacity>
      </View>
      
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FCFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Tagihan</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.trashButton}
            onPress={navigateToSampah}
          >
            <Ionicons name="trash-outline" size={20} color="#2691B5" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterText}>Filter</Text>
            <Ionicons name="chevron-down" size={14} color="#0A0A0A" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari tagihan..."
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

      <View style={styles.backgroundAccent}>
        <Ionicons name="flower" size={200} color="#2691B5" style={{ opacity: 0.15 }} />
      </View>

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>
            {searchQuery 
              ? `Tidak ditemukan tagihan "${searchQuery}"`
              : tagihan.length === 0 
                ? "Tidak ada tagihan saat ini."
                : `Tidak ada tagihan dengan status "${selectedFilter}"`}
          </Text>
          {searchQuery && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={clearSearch}
            >
              <Text style={styles.clearSearchText}>Hapus Pencarian</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            searchQuery ? (
              <View style={styles.searchResultHeader}>
                <Text style={styles.searchResultText}>
                  Ditemukan {filteredData.length} tagihan untuk "{searchQuery}"
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* 🎉 Modal Notifikasi Jatuh Tempo - LUCU & MENARIK */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationVisible}
        onRequestClose={hideNotification}
      >
        <View style={styles.notifModalContainer}>
          <Animated.View 
            style={[
              styles.notifModalContent,
              {
                transform: [
                  { scale: notifScaleAnim },
                  { translateX: shakeAnim }
                ]
              }
            ]}
          >
            {/* Header dengan icon alarm lucu */}
            <View style={styles.notifHeader}>
              <View style={styles.alarmIconContainer}>
                <Ionicons name="alarm" size={50} color="#FF6B6B" />
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{overdueTagihan.length}</Text>
                </View>
              </View>
              <Text style={styles.notifTitle}>⚠️ Peringatan! ⚠️</Text>
              <Text style={styles.notifSubtitle}>
                Kamu punya {overdueTagihan.length} tagihan yang sudah jatuh tempo!
              </Text>
            </View>

            {/* Emoji warning besar */}
            <View style={styles.emojiContainer}>
              <Text style={styles.bigEmoji}>😱💸</Text>
            </View>

            {/* List tagihan jatuh tempo */}
            <ScrollView style={styles.notifScrollView} showsVerticalScrollIndicator={false}>
              {overdueTagihan.map((item, index) => {
                const daysOverdue = getDaysOverdue(item.tanggalJatuhTempo);
                return (
                  <View key={index} style={styles.overdueCard}>
                    <View style={styles.overdueHeader}>
                      <View style={styles.overdueIconContainer}>
                        <Ionicons name="card" size={24} color="#FF6B6B" />
                      </View>
                      <View style={styles.overdueInfo}>
                        <Text style={styles.overdueTitle} numberOfLines={1}>
                          {item.namaTagihan}
                        </Text>
                        <Text style={styles.overdueAmount}>
                          Rp {formatNominal(item.nominal)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.overdueBadgeContainer}>
                      <View style={styles.overdueBadge}>
                        <Ionicons name="time" size={14} color="#FFFFFF" />
                        <Text style={styles.overdueBadgeText}>
                          {daysOverdue === 0 ? "Hari ini!" : `${daysOverdue} hari yang lalu`}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.payNowButton}
                      onPress={() => handlePayFromNotification(item)}
                    >
                      <Ionicons name="cash" size={18} color="#FFFFFF" />
                      <Text style={styles.payNowButtonText}>Bayar Sekarang</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Footer dengan button */}
            <View style={styles.notifFooter}>
              <Text style={styles.reminderText}>
                💡 Jangan sampai kena denda ya! Segera bayar tagihan kamu~
              </Text>
              <TouchableOpacity 
                style={styles.closeNotifButton}
                onPress={hideNotification}
              >
                <Text style={styles.closeNotifButtonText}>Mengerti, Tutup</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal Detail Tagihan */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={hideDetailModal}
      >
        <View style={styles.detailModalContainer}>
          <TouchableOpacity 
            style={styles.detailModalOverlay}
            activeOpacity={1}
            onPress={hideDetailModal}
          >
            <Animated.View 
              style={[
                styles.detailModalContent,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.detailCloseButton}
                onPress={hideDetailModal}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>

              <View style={styles.detailHeader}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="receipt" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.detailTitle}>Detail Tagihan</Text>
                <View style={[
                  styles.detailStatusBadge,
                  { 
                    backgroundColor: selectedTagihan?.status === "Lunas" ? "#00B050" : "#B71C1C" 
                  }
                ]}>
                  <Text style={styles.detailStatusText}>
                    {selectedTagihan?.status}
                  </Text>
                </View>
              </View>

              <ScrollView 
                style={styles.detailScrollView}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>📋 Informasi Tagihan</Text>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons name="pricetag" size={16} color="#2691B5" />
                      <Text style={styles.detailLabel}>Nama Tagihan</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedTagihan?.namaTagihan}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons name="cash" size={16} color="#2691B5" />
                      <Text style={styles.detailLabel}>Nominal</Text>
                    </View>
                    <Text style={styles.detailNominal}>
                      Rp {formatNominal(selectedTagihan?.nominal)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons name="calendar" size={16} color="#2691B5" />
                      <Text style={styles.detailLabel}>Jatuh Tempo</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedTagihan?.tanggalJatuhTempo)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons name="repeat" size={16} color="#2691B5" />
                      <Text style={styles.detailLabel}>Tipe Perulangan</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatTipePerulangan(selectedTagihan?.tipePerulangan)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>📝 Catatan</Text>
                  <View style={styles.notesContainer}>
                    {selectedTagihan?.catatan ? (
                      <Text style={styles.notesText}>
                        {selectedTagihan.catatan}
                      </Text>
                    ) : (
                      <View style={styles.emptyNotes}>
                        <Ionicons name="document-text-outline" size={40} color="#CCCCCC" />
                        <Text style={styles.emptyNotesText}>
                          Tidak ada catatan
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>ℹ️ Informasi Tambahan</Text>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons name="time" size={16} color="#2691B5" />
                      <Text style={styles.detailLabel}>Terakhir Dikirim</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatDateTime(selectedTagihan?.terakhirDikirim)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons name="person" size={16} color="#2691B5" />
                      <Text style={styles.detailLabel}>ID Pengguna</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {selectedTagihan?.pengguna?.idPengguna}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.detailActions}>
                {selectedTagihan?.status === "Belum Lunas" && (
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => handleBayar(selectedTagihan?.idTagihan)}
                  >
                    <Ionicons name="card" size={20} color="#FFFFFF" />
                    <Text style={styles.payButtonText}>Bayar Tagihan</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.secondaryActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEdit(selectedTagihan)}
                  >
                    <Ionicons name="create-outline" size={20} color="#2691B5" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(selectedTagihan)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#B71C1C" />
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal Filter */}
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

      {/* Modal Action */}
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
              onPress={() => selectedTagihan && handleEdit(selectedTagihan)}
            >
              <Ionicons name="create-outline" size={24} color="#2691B5" />
              <Text style={styles.actionOptionText}>Edit Tagihan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionOption, styles.deleteOption]}
              onPress={() => selectedTagihan && handleDelete(selectedTagihan)}
            >
              <Ionicons name="trash-outline" size={24} color="#B71C1C" />
              <Text style={[styles.actionOptionText, styles.deleteText]}>Pindah ke Sampah</Text>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2691B5",
    fontFamily: "Poppins",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trashButton: {
    padding: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterText: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "400",
    fontFamily: "Poppins",
  },
  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Poppins",
  },
  searchResultHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2691B5",
  },
  searchResultText: {
    fontSize: 14,
    color: "#2691B5",
    fontWeight: "500",
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
    color: "#0A0A0A",
    fontFamily: "Poppins",
  },
  menuButton: {
    padding: 4,
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
    lineHeight: 24,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
  },
  clearSearchText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Poppins",
  },
  
  // 🎨 STYLES UNTUK NOTIFIKASI POP-UP LUCU
  notifModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notifModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxHeight: "85%",
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    overflow: "hidden",
  },
  notifHeader: {
    backgroundColor: "#FF6B6B",
    padding: 24,
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  alarmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  alertBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFD700",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  alertBadgeText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  notifTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Poppins",
    marginBottom: 8,
    textAlign: "center",
  },
  notifSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins",
    textAlign: "center",
    lineHeight: 22,
  },
  emojiContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFF5F5",
  },
  bigEmoji: {
    fontSize: 60,
  },
  notifScrollView: {
    maxHeight: 350,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  overdueCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  overdueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  overdueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  overdueInfo: {
    flex: 1,
  },
  overdueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins",
    marginBottom: 4,
  },
  overdueAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
    fontFamily: "Poppins",
  },
  overdueBadgeContainer: {
    marginBottom: 12,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  overdueBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Poppins",
    marginLeft: 6,
  },
  payNowButton: {
    backgroundColor: "#00B050",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#00B050",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  payNowButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Poppins",
    marginLeft: 8,
  },
  notifFooter: {
    padding: 20,
    backgroundColor: "#FFF9E6",
    borderTopWidth: 2,
    borderTopColor: "#FFE5E5",
  },
  reminderText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  closeNotifButton: {
    backgroundColor: "#2691B5",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2691B5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeNotifButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
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
    color: "#2691B5",
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
  
  // Styles untuk Detail Modal
  detailModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  detailModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  detailCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  detailHeader: {
    backgroundColor: "#2691B5",
    padding: 24,
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  detailIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Poppins",
    marginBottom: 8,
  },
  detailStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins",
  },
  detailScrollView: {
    maxHeight: 400,
    padding: 20,
  },
  detailCard: {
    backgroundColor: "#F8FBFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2691B5",
    fontFamily: "Poppins",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F4FD",
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    fontFamily: "Poppins",
    textAlign: "right",
    flex: 1,
  },
  detailNominal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2691B5",
    fontFamily: "Poppins",
    textAlign: "right",
  },
  notesContainer: {
    minHeight: 80,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins",
    lineHeight: 20,
  },
  emptyNotes: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyNotesText: {
    fontSize: 14,
    color: "#999",
    fontFamily: "Poppins",
    marginTop: 8,
  },
  detailActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  payButton: {
    backgroundColor: "#00B050",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#2691B5",
  },
  editButtonText: {
    color: "#2691B5",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins",
    marginLeft: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#B71C1C",
  },
  deleteButtonText: {
    color: "#B71C1C",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins",
    marginLeft: 6,
  },
});