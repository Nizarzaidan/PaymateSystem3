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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";

const { width } = Dimensions.get("window");

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

  // Data level dan reward dengan warna asli medali
  const levelData = {
    Pemula: { minMedal: 0, color: "#6B7280", icon: "⭐", gradient: ["#2691B5", "#1E6A8D"] },
    Perunggu: { minMedal: 1, color: "#CD7F32", icon: "🥉", gradient: ["#CD7F32", "#B06F2C"] },
    Perak: { minMedal: 3, color: "#C0C0C0", icon: "🥈", gradient: ["#C0C0C0", "#A8A8A8"] },
    Emas: { minMedal: 5, color: "#FFD700", icon: "🥇", gradient: ["#FFD700", "#E6C300"] },
    Platinum: { minMedal: 8, color: "#E5E4E2", icon: "🏆", gradient: ["#E5E4E2", "#C9C8C6"] },
    Berlian: { minMedal: 12, color: "#B9F2FF", icon: "💎", gradient: ["#B9F2FF", "#97D9E8"] },
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchRewardData();
    }
  }, [userId]);

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

  const getLevelByMedalCount = (medalCount) => {
    if (medalCount >= levelData.Berlian.minMedal) return "Berlian";
    if (medalCount >= levelData.Platinum.minMedal) return "Platinum";
    if (medalCount >= levelData.Emas.minMedal) return "Emas";
    if (medalCount >= levelData.Perak.minMedal) return "Perak";
    if (medalCount >= levelData.Perunggu.minMedal) return "Perunggu";
    return "Pemula";
  };

  const updateLevel = () => {
    const newLevel = getLevelByMedalCount(medali);
    setLevel(newLevel);
  };

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

  // Komponen Progress Bar
  const ProgressBar = ({ progress, color }) => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill,
            { 
              width: `${((300 - poinKeMedaliBerikutnya) / 300) * 100}%`,
              backgroundColor: color
            }
          ]} 
        />
      </View>
      <View style={styles.progressBarDecoration}>
        <View style={[styles.progressDot, { backgroundColor: color }]} />
        <View style={[styles.progressDot, { backgroundColor: color }]} />
        <View style={[styles.progressDot, { backgroundColor: color }]} />
      </View>
    </View>
  );

  // Komponen kartu statistik
  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        style={styles.statCardGradient}
      >
        <View style={styles.statIconContainer}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </View>
  );

  // Komponen badge medali
  const MedalBadge = ({ type, isCurrentLevel }) => (
    <Animatable.View 
      animation={isCurrentLevel ? "pulse" : undefined}
      duration={2000}
      iterationCount="infinite"
      style={styles.medalBadgeWrapper}
    >
      <LinearGradient
        colors={isCurrentLevel ? levelData[type].gradient : ["#F1F5F9", "#E2E8F0"]}
        style={[
          styles.medalBadge,
          isCurrentLevel && styles.currentMedalBadge
        ]}
      >
        <Text style={styles.medalIcon}>{levelData[type].icon}</Text>
        <Text style={[
          styles.medalText,
          isCurrentLevel && styles.currentMedalText
        ]}>
          {type}
        </Text>
        {isCurrentLevel && (
          <View style={styles.activeIndicator}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          </View>
        )}
      </LinearGradient>
    </Animatable.View>
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
      {/* Header dengan Gradient biru */}
      <LinearGradient
        colors={["#2691B5", "#1E6A8D"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Reward Target 🎯</Text>
            <Text style={styles.headerSubtitle}>
              Kumpulkan poin dan raih medali!
            </Text>
          </View>
          <View style={styles.headerDecoration}>
            <Text style={styles.decorationIcon}>✨</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Kartu Progress Utama dengan gradient biru */}
        <Animatable.View 
          animation="fadeInUp"
          duration={800}
          style={styles.mainCardWrapper}
        >
          <LinearGradient
            colors={["#2691B5", "#1E6A8D"]}
            style={styles.mainCard}
          >
            <View style={styles.mainCardContent}>
              <View style={styles.levelSection}>
                <View style={styles.levelIconContainer}>
                  <Text style={styles.levelIcon}>
                    {levelData[level].icon}
                  </Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelLabel}>Level Kamu</Text>
                  <Text style={styles.levelName}>{level}</Text>
                </View>
                <View style={styles.floatingStars}>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={styles.star}>🌟</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <ProgressBar 
                  progress={((300 - poinKeMedaliBerikutnya) / 300) * 100}
                  color="#FFFFFF"
                />
                <Text style={styles.progressText}>
                  {300 - poinKeMedaliBerikutnya}/300 poin menuju medali berikutnya 🎯
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statBubble}>
                    <Text style={styles.statNumber}>{poin}</Text>
                  </View>
                  <Text style={styles.statLabel}>Total Poin</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Animated.View 
                    style={[
                      styles.statBubble,
                      { transform: [{ scale: scaleValue }] }
                    ]}
                  >
                    <Text style={styles.statNumber}>{medali}</Text>
                  </Animated.View>
                  <Text style={styles.statLabel}>Total Medali</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Kartu Statistik */}
        <Animatable.View 
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.statsGrid}
        >
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
            color="#2691B5"
            icon="🏅"
          />
        </Animatable.View>

        {/* Info Level Berikutnya */}
        <Animatable.View 
          animation="fadeInUp"
          duration={800}
          delay={400}
          style={styles.nextLevelCard}
        >
          <LinearGradient
            colors={["#F0F9FF", "#E0F2FE"]}
            style={styles.nextLevelGradient}
          >
            <View style={styles.nextLevelContent}>
              <View style={styles.rocketContainer}>
                <Ionicons name="rocket" size={28} color="#2691B5" />
              </View>
              <View style={styles.nextLevelInfo}>
                <Text style={styles.nextLevelTitle}>
                  Menuju {getLevelByMedalCount(medali + 1)} {levelData[getLevelByMedalCount(medali + 1)]?.icon}
                </Text>
                <Text style={styles.nextLevelSubtitle}>
                  Butuh {poinKeMedaliBerikutnya} poin lagi untuk medali berikutnya! 🚀
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Daftar Level & Medali */}
        <Animatable.View 
          animation="fadeInUp"
          duration={800}
          delay={600}
          style={styles.levelsSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tingkat Pencapaian</Text>
            <Text style={styles.sectionIcon}>🏆</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Kumpulkan medali untuk naik level dan dapatkan reward!
          </Text>

          <View style={styles.levelsGrid}>
            {Object.keys(levelData).map((levelType) => (
              <MedalBadge
                key={levelType}
                type={levelType}
                isCurrentLevel={level === levelType}
              />
            ))}
          </View>
        </Animatable.View>

        {/* Informasi Reward */}
        <Animatable.View 
          animation="fadeInUp"
          duration={800}
          delay={800}
          style={styles.infoCard}
        >
          <LinearGradient
            colors={["#F0F9FF", "#E0F2FE"]}
            style={styles.infoGradient}
          >
            <View style={styles.infoHeader}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={24} color="#2691B5" />
              </View>
              <Text style={styles.infoTitle}>Cara Mendapatkan Poin</Text>
            </View>
            <View style={styles.infoContent}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🎯</Text>
                <Text style={styles.infoText}>Menyelesaikan target tabungan: +30 poin</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🏅</Text>
                <Text style={styles.infoText}>Setiap 300 poin: 1 medali</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⭐</Text>
                <Text style={styles.infoText}>Medali menentukan level kamu</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>💫</Text>
                <Text style={styles.infoText}>Poin hanya diberikan ketika target tercapai!</Text>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFBFF",
  },
  loadingText: {
    marginTop: 10,
    color: "#2691B5",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0F2FE",
    fontWeight: "500",
    marginTop: 4,
  },
  headerDecoration: {
    padding: 8,
  },
  decorationIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  mainCardWrapper: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
  },
  mainCard: {
    borderRadius: 25,
    overflow: "hidden",
  },
  mainCardContent: {
    padding: 25,
  },
  levelSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
  },
  levelIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 12,
    marginRight: 15,
  },
  levelIcon: {
    fontSize: 32,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: "500",
  },
  levelName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  floatingStars: {
    position: "absolute",
    right: 0,
    top: -10,
  },
  star: {
    fontSize: 16,
    opacity: 0.8,
  },
  progressSection: {
    marginBottom: 25,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  progressBarDecoration: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 5,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 13,
    opacity: 0.9,
    fontWeight: "500",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statBubble: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statNumber: {
    color: "#2691B5",
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.9,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  statCardGradient: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  statIconContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  nextLevelCard: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  nextLevelGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  nextLevelContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  rocketContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  nextLevelInfo: {
    flex: 1,
  },
  nextLevelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2691B5",
    marginBottom: 4,
  },
  nextLevelSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  levelsSection: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 20,
  },
  levelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  medalBadgeWrapper: {
    width: (width - 80) / 3,
    marginBottom: 12,
  },
  medalBadge: {
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    minHeight: 100,
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  currentMedalBadge: {
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  medalIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  medalText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },
  currentMedalText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  activeIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#2691B5",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  infoGradient: {
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIconContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2691B5",
  },
  infoContent: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },
});

export default RewardTarget;