import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
    fetchLeaderboard();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const data = JSON.parse(userDataString);
        setCurrentUserId(data.idPengguna || data.id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      let response;
      try {
        response = await axios.get(
          `${BASE_URL}/pengguna/ranking`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
      } catch (primaryError) {
        response = await axios.get(
          `${BASE_URL}/pengguna/leaderboard`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
      }

      if (response.data) {
        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || response.data.users || [];
        
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      
      let errorMessage = "Gagal memuat leaderboard";
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "Endpoint leaderboard tidak ditemukan. Hubungi admin.";
            break;
          case 401:
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
            setTimeout(() => {
              navigation.replace("LoginScreen");
            }, 2000);
            break;
          case 403:
            errorMessage = "Anda tidak memiliki akses ke leaderboard.";
            break;
          case 500:
            errorMessage = "Terjadi kesalahan server. Coba lagi nanti.";
            break;
          default:
            errorMessage = `Error: ${error.response.data?.message || error.message}`;
        }
      } else if (error.request) {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message === "Token tidak ditemukan. Silakan login kembali.") {
        errorMessage = error.message;
        setTimeout(() => {
          navigation.replace("LoginScreen");
        }, 2000);
      } else {
        errorMessage = error.message || "Terjadi kesalahan";
      }
      
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const getLevelByMedalCount = (medalCount) => {
    if (medalCount >= 12) return { name: "Berlian", icon: "💎", color: "#B9F2FF" };
    if (medalCount >= 8) return { name: "Platinum", icon: "🏆", color: "#E5E4E2" };
    if (medalCount >= 5) return { name: "Emas", icon: "🥇", color: "#FFD700" };
    if (medalCount >= 3) return { name: "Perak", icon: "🥈", color: "#C0C0C0" };
    if (medalCount >= 1) return { name: "Perunggu", icon: "🥉", color: "#CD7F32" };
    return { name: "Pemula", icon: "⭐", color: "#6B7280" };
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏅";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingIcon}>🏆</Text>
          <ActivityIndicator size="large" color="#2691B5" />
          <Text style={styles.loadingText}>Memuat leaderboard...</Text>
        </View>
      </View>
    );
  }

  if (error && leaderboardData.length === 0) {
    return (
      <View style={styles.container}>
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
              <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>😢</Text>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchLeaderboard}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
            <Text style={styles.headerSubtitle}>
              {leaderboardData.length} Pengguna Terdaftar
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2691B5"]}
            tintColor="#2691B5"
          />
        }
      >
        {leaderboardData.length > 0 ? (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            style={styles.tableWrapper}
          >
            {/* Hint untuk scroll */}
            <View style={styles.scrollHint}>
              <Ionicons name="swap-horizontal" size={16} color="#64748B" />
              <Text style={styles.scrollHintText}>Geser ke samping untuk melihat semua data</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={styles.tableScrollView}
              contentContainerStyle={styles.tableScrollContent}
            >
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <View style={styles.headerRank}>
                    <Text style={styles.headerText}>Rank</Text>
                  </View>
                  <View style={styles.headerUser}>
                    <Text style={styles.headerText}>Pengguna</Text>
                  </View>
                  <View style={styles.headerLevel}>
                    <Text style={styles.headerText}>Level</Text>
                  </View>
                  <View style={styles.headerStat}>
                    <Text style={styles.headerText}>Poin</Text>
                  </View>
                  <View style={styles.headerStat}>
                    <Text style={styles.headerText}>Medali</Text>
                  </View>
                </View>

                {/* Table Rows */}
                {leaderboardData.map((user, index) => {
                  const level = getLevelByMedalCount(user.medali || 0);
                  const isCurrentUser = user.idPengguna === currentUserId || user.id === currentUserId;
                  const rank = index + 1;

                  return (
                    <Animatable.View
                      key={user.idPengguna || user.id || index}
                      animation="fadeInRight"
                      delay={index * 50}
                      duration={500}
                    >
                      <LinearGradient
                        colors={isCurrentUser ? ["#E0F2FE", "#BFDBFE"] : ["#FFFFFF", "#FFFFFF"]}
                        style={[
                          styles.tableRow,
                          isCurrentUser && styles.currentUserRow,
                          rank <= 3 && styles.topThreeRow
                        ]}
                      >
                        {/* Rank Column */}
                        <View style={styles.cellRank}>
                          <View style={[styles.rankBadge, rank <= 3 && styles.topRankBadge]}>
                            <Text style={styles.rankIcon}>{getRankIcon(rank)}</Text>
                            <Text style={[styles.rankNumber, rank <= 3 && styles.topRankNumber]}>
                              #{rank}
                            </Text>
                          </View>
                        </View>

                        {/* User Column */}
                        <View style={styles.cellUser}>
                          <View style={styles.userInfo}>
                            {user.fotoProfil || user.foto_profil ? (
                              <Image
                                source={{ uri: user.fotoProfil || user.foto_profil }}
                                style={[styles.avatar, isCurrentUser && styles.currentUserAvatar]}
                              />
                            ) : (
                              <View style={[styles.avatarPlaceholder, isCurrentUser && styles.currentUserAvatar]}>
                                <Ionicons name="person" size={22} color="#2691B5" />
                              </View>
                            )}
                            <View style={styles.nameWrapper}>
                              <Text style={styles.userName} numberOfLines={1}>
                                {user.namaPanggilan || user.nama_panggilan || user.namaLengkap || user.nama_lengkap || "User"}
                              </Text>
                              {isCurrentUser && (
                                <View style={styles.youBadge}>
                                  <Text style={styles.youText}>Kamu</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>

                        {/* Level Column */}
                        <View style={styles.cellLevel}>
                          <View style={styles.levelBadge}>
                            <Text style={styles.levelIcon}>{level.icon}</Text>
                            <Text style={styles.levelName}>{level.name}</Text>
                          </View>
                        </View>

                        {/* Points Column */}
                        <View style={styles.cellStat}>
                          <View style={styles.statBox}>
                            <Text style={styles.statValue}>{user.poin || 0}</Text>
                          </View>
                        </View>

                        {/* Medals Column */}
                        <View style={styles.cellStat}>
                          <View style={styles.statBox}>
                            <Text style={styles.statValue}>{user.medali || 0}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </Animatable.View>
                  );
                })}
              </View>
            </ScrollView>
          </Animatable.View>
        ) : (
          <Animatable.View 
            animation="fadeIn"
            style={styles.emptyContainer}
          >
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>Belum Ada Data</Text>
            <Text style={styles.emptySubtext}>
              Mulai menabung untuk masuk ke leaderboard!
            </Text>
          </Animatable.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#2691B5",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: "#2691B5",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#2691B5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  refreshButton: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#E0F2FE",
    fontWeight: "500",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  tableWrapper: {
    margin: 12,
  },
  scrollHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  scrollHintText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  tableScrollView: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  tableScrollContent: {
    paddingRight: 12,
  },
  tableContainer: {
    minWidth: width - 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  
  // Table Header Styles
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2691B5",
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  headerRank: {
    width: 80,
    alignItems: "center",
  },
  headerUser: {
    width: 180,
    paddingLeft: 4,
  },
  headerLevel: {
    width: 120,
    alignItems: "center",
  },
  headerStat: {
    width: 90,
    alignItems: "center",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  
  // Table Row Styles
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
    minHeight: 85,
  },
  currentUserRow: {
    borderLeftWidth: 5,
    borderLeftColor: "#2691B5",
    backgroundColor: "#E0F2FE",
  },
  topThreeRow: {
    backgroundColor: "#FFFBEB",
  },
  
  // Cell Styles dengan Fixed Width
  cellRank: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  cellUser: {
    width: 180,
    paddingLeft: 4,
    paddingRight: 8,
  },
  cellLevel: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cellStat: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Rank Badge
  rankBadge: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    width: 60,
  },
  topRankBadge: {
    backgroundColor: "#FEF3C7",
  },
  rankIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  topRankNumber: {
    color: "#F59E0B",
  },
  
  // User Info
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  currentUserAvatar: {
    borderColor: "#2691B5",
    borderWidth: 3,
  },
  nameWrapper: {
    flex: 1,
    gap: 5,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  youBadge: {
    backgroundColor: "#2691B5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  youText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  
  // Level Badge
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  levelIcon: {
    fontSize: 16,
  },
  levelName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  
  // Stat Box
  statBox: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    width: 70,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2691B5",
  },
  
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 24,
  },
});

export default LeaderboardScreen;