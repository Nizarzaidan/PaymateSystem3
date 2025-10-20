import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function TabunganScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState("Harian");
  const [image, setImage] = useState(null);

  // fungsi untuk memilih gambar
  const pickImage = async () => {
    // minta izin akses galeri
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Izin Ditolak",
        "Izinkan aplikasi mengakses galeri terlebih dahulu."
      );
      return;
    }

    // buka galeri
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        ></TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Simpan</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Gambar */}
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.uploadedImage} />
        ) : (
          <>
            <Ionicons name="image-outline" size={50} color="#1E3A8A" />
            <Ionicons
              name="add-circle"
              size={20}
              color="#1E3A8A"
              style={styles.addIcon}
            />
          </>
        )}
      </TouchableOpacity>

      {/* Nama Tabungan */}
      <View style={styles.inputWrapper}>
        <Ionicons name="reorder-three" size={20} color="#64748B" />
        <TextInput
          style={styles.input}
          placeholder="Nama Tabungan"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Target Tabungan */}
      <View style={styles.inputWrapper}>
        <Ionicons name="keypad-outline" size={20} color="#64748B" />
        <TextInput
          style={styles.input}
          placeholder="Target Tabungan"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />
      </View>

      {/* Mata Uang */}
      <View style={styles.inputWrapper}>
        <Ionicons name="remove-outline" size={20} color="#EF4444" />
        <TextInput
          style={styles.input}
          placeholder="Indonesia Rupiah (Rp)"
          placeholderTextColor="#9CA3AF"
        />
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </View>

      {/* Rencana Pengisian */}
      <Text style={styles.sectionTitle}>Rencana Pengisian</Text>
      <View style={styles.planContainer}>
        {["Harian", "Mingguan", "Bulanan"].map((plan) => (
          <TouchableOpacity
            key={plan}
            style={[
              styles.planButton,
              selectedPlan === plan && styles.planButtonActive,
            ]}
            onPress={() => setSelectedPlan(plan)}
          >
            <Text
              style={[
                styles.planText,
                selectedPlan === plan && styles.planTextActive,
              ]}
            >
              {plan}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nominal Pengisian */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Nominal Pengisian"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />
        <Ionicons name="calendar-outline" size={20} color="#1E3A8A" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveText: { color: "#fff", fontWeight: "600" },
  uploadBox: {
    backgroundColor: "#E2E8F0",
    height: 130,
    borderRadius: 10,
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  addIcon: {
    position: "absolute",
    bottom: 35,
    right: 120,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginVertical: 8,
    color: "#1E293B",
  },
  planContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    marginBottom: 20,
  },
  planButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  planButtonActive: {
    backgroundColor: "#3B82F6",
  },
  planText: {
    color: "#1E293B",
    fontWeight: "500",
  },
  planTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
});
