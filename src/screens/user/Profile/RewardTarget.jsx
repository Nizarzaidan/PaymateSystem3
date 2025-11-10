import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";

const RewardTarget = ({ navigation }) => {
  const [poin, setPoin] = useState(0);
  const [medali, setMedali] = useState(0);
  const [level, setLevel] = useState("Pemula");
  const [showAnimation, setShowAnimation] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [poinKeMedaliBerikutnya, setPoinKeMedaliBerikutnya] = useState(300);

  // Data level dan reward
  const levelData = {
    Pemula: { minMedal: 0, color: "#6B7280", icon: "🌱" },
    Perunggu: { minMedal: 1, color: "#CD7F32", icon: "🥉" },
    Perak: { minMedal: 3, color: "#C0C0C0", icon: "🥈" },
    Emas: { minMedal: 5, color: "#FFD700", icon: "🥇" },
    Platinum: { minMedal: 8, color: "#E5E4E2", icon: "🏆" },
    Berlian: { minMedal: 12, color: "#B9F2FF", icon: "💎" },
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchRewardData();
    }
  }, [userId]);

  // Update level ketika medali berubah
  useEffect(() => {
    updateLevel();
  }, [medali]);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const data = JSON.parse(userDataString);
        setUserData(data);
        setUserId(data.idPengguna || data.id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchRewardData = async () => {
    if (!userId) {
      console.log("❌ User ID not available");
      return;
    }

    try {
      setLoading(true);
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
        setPoin(rewardInfo.poin || 0);
        setMedali(rewardInfo.medali || 0);
        setPoinKeMedaliBerikutnya(rewardInfo.poinKeMedaliBerikutnya || 300);
      }
    } catch (error) {
      console.error("Error fetching reward data:", error);
      Alert.alert("Error", "Gagal memuat data reward");
    } finally {
      setLoading(false);
    }
  };

  //  // Simulasi menabung (untuk testing) - Panggil API backend
  // const simulasiMenabung = async () => {
  //   try {
  //     const idPengguna = userData.id_pengguna || 1;
  //     const token = await AsyncStorage.getItem("jwtToken");

  //     const response = await axios.post(
  //       `${BASE_URL}/reward-gamification/tambah-poin/${idPengguna}`,
  //       {},
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       }
  //     );

  //     if (response.data && response.data.code === 200) {
  //       const result = response.data.data;
        
  //       setPoin(result.poinBaru);
        
  //       if (result.naikMedali) {
  //         setMedali(result.medaliBaru);
  //         triggerMedalAnimation();
          
  //         Alert.alert(
  //           "🎉 Level Up!",
  //           `Selamat! Anda naik ke level ${getLevelByMedalCount(result.medaliBaru)} ${levelData[getLevelByMedalCount(result.medaliBaru)].icon}`,
  //           [{ text: "Keren!" }]
  //         );
  //       } else {
  //         Alert.alert(
  //           "💰 Poin Bertambah!",
  //           `+${result.poinDitambah} poin! Total: ${result.poinBaru} poin`,
  //           [{ text: "Lanjutkan!" }]
  //         );
  //       }

  //       // Refresh data
  //       fetchRewardData();
  //     }
  //   } catch (error) {
  //     console.error("Error tambah poin:", error);
  //     Alert.alert("Error", "Gagal menambah poin");
  //   }
  // };

  // Fungsi untuk menentukan level berdasarkan jumlah medali
  const getLevelByMedalCount = (medalCount) => {
    if (medalCount >= levelData.Berlian.minMedal) return "Berlian";
    if (medalCount >= levelData.Platinum.minMedal) return "Platinum";
    if (medalCount >= levelData.Emas.minMedal) return "Emas";
    if (medalCount >= levelData.Perak.minMedal) return "Perak";
    if (medalCount >= levelData.Perunggu.minMedal) return "Perunggu";
    return "Pemula";
  };

  // Update level berdasarkan medali
  const updateLevel = () => {
    const newLevel = getLevelByMedalCount(medali);
    setLevel(newLevel);
  };

  // Animasi saat mendapatkan medali
  const triggerMedalAnimation = () => {
    setShowAnimation(true);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.5,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAnimation(false);
    });
  };

  // Komponen kartu statistik
  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <LinearGradient
      colors={["#FFFFFF", "#F8FAFC"]}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </LinearGradient>
  );

  // Komponen badge medali
  const MedalBadge = ({ count, type, isCurrentLevel }) => (
    <View style={[
      styles.medalBadge,
      isCurrentLevel && styles.currentMedalBadge
    ]}>
      <Text style={styles.medalIcon}>{levelData[type].icon}</Text>
      <Text style={[
        styles.medalText,
        isCurrentLevel && styles.currentMedalText
      ]}>
        {type}
      </Text>
      <Text style={styles.medalCount}>
        {count >= levelData[type].minMedal ? "✓" : `${levelData[type].minMedal}+`}
      </Text>
    </View>
  );

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
        <Text style={styles.loadingText}>Memuat data reward...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header dengan Gradient */}
      <LinearGradient
        colors={["#2691B5", "#1E6A8D"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Reward Target 🎯</Text>
            <Text style={styles.headerSubtitle}>
              Kumpulkan poin dan raih medali!
            </Text>
            <Text style={styles.userInfoText}></Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu Progress Utama */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.mainCard}
        >
          <Animatable.View 
            animation={showAnimation ? "pulse" : undefined}
            duration={1000}
            style={styles.mainCardContent}
          >
            <View style={styles.levelSection}>
              <Text style={styles.levelIcon}>
                {levelData[level].icon}
              </Text>
              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>Level Saat Ini</Text>
                <Text style={styles.levelName}>{level}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${((300 - poinKeMedaliBerikutnya) / 300) * 100}%`,
                      backgroundColor: levelData[level].color
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {300 - poinKeMedaliBerikutnya}/300 poin menuju medali berikutnya
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{poin}</Text>
                <Text style={styles.statLabel}>Total Poin</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Animated.Text 
                  style={[
                    styles.statNumber,
                    { transform: [{ scale: scaleValue }] }
                  ]}
                >
                  {medali}
                </Animated.Text>
                <Text style={styles.statLabel}>Total Medali</Text>
              </View>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Kartu Statistik */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Poin Saat Ini"
            value={poin}
            subtitle="Dari menabung"
            color="#2691B5"
            icon="💰"
          />
          <StatCard
            title="Medali"
            value={medali}
            subtitle="Terkumpul"
            color="#F59E0B"
            icon="🏅"
          />
        </View>

        {/* Info Level Berikutnya */}
        <View style={styles.nextLevelCard}>
          <Ionicons name="rocket-outline" size={24} color="#2691B5" />
          <View style={styles.nextLevelInfo}>
            <Text style={styles.nextLevelTitle}>
              Menuju {getLevelByMedalCount(medali + 1)}
            </Text>
            <Text style={styles.nextLevelSubtitle}>
              Butuh {poinKeMedaliBerikutnya} poin lagi untuk medali berikutnya
            </Text>
          </View>
          <Text style={styles.nextLevelIcon}>
            {levelData[getLevelByMedalCount(medali + 1)]?.icon}
          </Text>
        </View>

        {/* Daftar Level & Medali */}
        <View style={styles.levelsSection}>
          <Text style={styles.sectionTitle}>Tingkat Pencapaian</Text>
          <Text style={styles.sectionSubtitle}>
            Raih semua level dengan mengumpulkan medali
          </Text>

          <View style={styles.levelsGrid}>
            {Object.keys(levelData).map((levelType) => (
              <MedalBadge
                key={levelType}
                type={levelType}
                count={medali}
                isCurrentLevel={level === levelType}
              />
            ))}
          </View>
        </View>

          {/* Tombol Simulasi Menabung (untuk testing)
        <TouchableOpacity
          style={styles.actionButton}
          onPress={simulasiMenabung}
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.buttonGradient}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Simulasi Menabung +30 Poin</Text>
          </LinearGradient>
        </TouchableOpacity> */}

        {/* Informasi Reward */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2691B5" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cara Mendapatkan Poin</Text>
            <Text style={styles.infoText}>
              • Setiap menyelesaikan target tabungan: +30 poin{"\n"}
              • Setiap 300 poin: 1 medali{"\n"}
              • Medali menentukan level Anda{"\n"}
              • Poin otomatis bertambah saat tabungan selesai!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#2691B5",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0F2FE",
    fontWeight: "500",
    marginTop: 2,
  },
  userInfoText: {
    fontSize: 12,
    color: "#E0F2FE",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  mainCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  mainCardContent: {
    padding: 24,
  },
  levelSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  levelIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  levelName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 15,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  nextLevelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  nextLevelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nextLevelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  nextLevelSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  nextLevelIcon: {
    fontSize: 24,
  },
  levelsSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  levelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  medalBadge: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    minWidth: 80,
    borderWidth: 2,
    borderColor: "transparent",
  },
  currentMedalBadge: {
    backgroundColor: "#F0F9FF",
    borderColor: "#2691B5",
  },
  medalIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  medalText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },
  currentMedalText: {
    color: "#2691B5",
    fontWeight: "bold",
  },
  medalCount: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#2691B5",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2691B5",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#0369A1",
    lineHeight: 20,
  },
});

export default RewardTarget;