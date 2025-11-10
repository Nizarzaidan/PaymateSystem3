import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook untuk detect ketika screen focused
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused]); // Reload data setiap kali screen focused

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserData(userData);
        console.log("ProfileScreen - User data loaded:", {
          nama: userData.namaLengkap || userData.nama_lengkap,
          fotoProfil: userData.fotoProfil || userData.foto_profil,
          semuaData: userData
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace("LoginScreen");
          }
        }
      ]
    );
  };

  // Format tanggal untuk display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return "-";
    }
  };

  // Dapatkan URL foto profil dengan prioritas
  const getProfilePhoto = () => {
    if (!userData) return null;
    
    // Prioritaskan fotoProfil, lalu foto_profil
    const photoUrl = userData.fotoProfil || userData.foto_profil;
    console.log("Profile photo URL:", photoUrl);
    return photoUrl;
  };

  // Dapatkan nama untuk display
  const getDisplayName = () => {
    if (!userData) return "Pengguna";
    
    // Prioritaskan nama panggilan, lalu nama lengkap
    return userData.namaPanggilan || userData.nama_panggilan || 
           userData.namaLengkap || userData.nama_lengkap || "Pengguna";
  };

  // Dapatkan email
  const getEmail = () => {
    if (!userData) return "";
    return userData.email || "";
  };

  // Dapatkan tanggal daftar
  const getJoinDate = () => {
    if (!userData) return "-";
    const joinDate = userData.tanggalDaftar || userData.tanggal_daftar;
    return formatDate(joinDate);
  };

  const menuItems = [
    {
      id: 1,
      title: "Kelola Akun",
      icon: "person-outline",
      onPress: () => navigation.navigate("KelolaAkun"),
      showArrow: true
    },
    {
    id: 2,
    title: "Kelola Kategori",
    icon: "grid-outline",
    onPress: () => navigation.navigate("KelolaKategori"), // Diperbaiki dari Alert ke navigation
    showArrow: true
  },
    {
      id: 3,
      title: "Reward Target",
      icon: "trophy-outline",
      onPress: () => navigation.navigate("RewardTarget"), 
      showArrow: true
    },
  ];

  const profilePhoto = getProfilePhoto();
  const displayName = getDisplayName();
  const email = getEmail();
  const joinDate = getJoinDate();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2691B5" barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            {profilePhoto ? (
              <Image 
                source={{ uri: profilePhoto }} 
                style={styles.profileImage}
                onError={(error) => {
                  console.log("Error loading profile image:", error.nativeEvent.error);
                  console.log("Failed URL:", profilePhoto);
                }}
                onLoad={() => console.log("Profile image loaded successfully")}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.headerEmail} numberOfLines={1}>
                {email}
              </Text>
              <Text style={styles.headerDetail}>
                Bergabung sejak {joinDate}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        

        {/* MENU ITEMS */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={22} color="#2691B5" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              {item.showArrow && (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

       
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Ionicons name="home-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("RiwayatScreen")}
        >
          <Ionicons name="time-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Riwayat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("LihatTabunganScreen")}
        >
          <MaterialIcons name="savings" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Tabungan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TagihanScreen")}
        >
          <Ionicons name="receipt-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Tagihan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#2691B5" />
          <Text style={[styles.navText, styles.activeText]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#2691B5",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerEmail: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginBottom: 4,
  },
  headerDetail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  infoContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  statusActive: {
    color: "#10B981",
    fontWeight: "700",
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  // Debug styles
  debugContainer: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    color: "#856404",
    marginBottom: 3,
  },
  refreshText: {
    fontSize: 12,
    color: "#2691B5",
    fontWeight: "bold",
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  navItem: { 
    flex: 1, 
    alignItems: "center",
    paddingVertical: 5,
  },
  navText: { 
    fontSize: 11, 
    color: "#9CA3AF", 
    marginTop: 4,
    fontWeight: "500",
  },
  activeText: { 
    color: "#2691B5", 
    fontWeight: "700" 
  },
});