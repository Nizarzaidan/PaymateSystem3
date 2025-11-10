import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import api from "../api/apiClient"; // ✅ pakai api dari folder api
import axios from "axios";
<<<<<<< HEAD:src/screens/TabunganScreen.jsx
import DateTimePicker from "@react-native-community/datetimepicker";
=======
import { BASE_URL } from "../../../api/apiClient";
import DateTimePicker from '@react-native-community/datetimepicker';
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/TabunganScreen.jsx

export default function TabunganScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState("harian");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
<<<<<<< HEAD:src/screens/TabunganScreen.jsx

=======
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/TabunganScreen.jsx
  // State untuk form
  const [formData, setFormData] = useState({
    namaTarget: "",
    targetNominal: "",
    nominalPengisian: "",
    tanggalMulai: new Date().toISOString().split("T")[0], // Default hari ini
    tanggalSelesai: "",
    catatan: "",
  });

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        console.log("👤 User data loaded:", user);
        setUserId(user.idPengguna || user.id);
        setUserData(user);
      } else {
        console.log("❌ No user data found");
        Alert.alert("Error", "Silakan login kembali");
        navigation.goBack();
      }
    } catch (error) {
      console.error("❌ Error getting user data:", error);
    }
  };

  // Fungsi untuk memilih gambar
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Izin Ditolak",
        "Izinkan aplikasi mengakses galeri terlebih dahulu."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format currency untuk display
  const formatCurrency = (value) => {
    // Hapus semua karakter non-digit
    const numericValue = value.replace(/\D/g, "");

    // Format dengan titik sebagai pemisah ribuan
    if (numericValue) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    return "";
  };

  // Konversi dari format currency ke angka
  const parseCurrency = (value) => {
    return parseInt(value.replace(/\./g, "")) || 0;
  };

  // Validasi form
  const validateForm = () => {
    if (!formData.namaTarget.trim()) {
      Alert.alert("Error", "Nama tabungan harus diisi");
      return false;
    }

    const targetNominal = parseCurrency(formData.targetNominal);
    if (!targetNominal || targetNominal <= 0) {
      Alert.alert("Error", "Target nominal harus diisi dan lebih dari 0");
      return false;
    }

    const nominalPengisian = parseCurrency(formData.nominalPengisian);
    if (!nominalPengisian || nominalPengisian <= 0) {
      Alert.alert("Error", "Nominal pengisian harus diisi dan lebih dari 0");
      return false;
    }

    if (!formData.tanggalSelesai) {
      Alert.alert("Error", "Tanggal selesai harus diisi");
      return false;
    }

    // Validasi tanggal selesai harus setelah tanggal mulai
    const startDate = new Date(formData.tanggalMulai);
    const endDate = new Date(formData.tanggalSelesai);
    if (endDate <= startDate) {
      Alert.alert("Error", "Tanggal selesai harus setelah tanggal mulai");
      return false;
    }

    // Validasi nominal pengisian tidak lebih besar dari target
    if (nominalPengisian > targetNominal) {
      Alert.alert(
        "Error",
        "Nominal pengisian tidak boleh lebih besar dari target tabungan"
      );
      return false;
    }

    return true;
  };

  // Hitung nominal pengisian otomatis berdasarkan frekuensi
  const calculateAutoNominal = () => {
    const targetNominal = parseCurrency(formData.targetNominal);
    if (!targetNominal || !formData.tanggalSelesai) return;

    const startDate = new Date(formData.tanggalMulai);
    const endDate = new Date(formData.tanggalSelesai);

    if (endDate <= startDate) return;

    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let calculatedNominal = 0;

    switch (selectedPlan) {
      case "harian":
        calculatedNominal = Math.ceil(targetNominal / daysDiff);
        break;
      case "mingguan":
        const weeks = Math.ceil(daysDiff / 7);
        calculatedNominal = Math.ceil(targetNominal / weeks);
        break;
      case "bulanan":
        const months = Math.ceil(daysDiff / 30);
        calculatedNominal = Math.ceil(targetNominal / months);
        break;
    }

    // Set minimal nominal 1000
    calculatedNominal = Math.max(calculatedNominal, 1000);

    setFormData((prev) => ({
      ...prev,
      nominalPengisian: formatCurrency(calculatedNominal.toString()),
    }));
  };

  // Simpan tabungan ke backend
  const saveTabungan = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Format data sesuai dengan backend - pastikan angka dikirim sebagai number, bukan string
      const payload = {
        pengguna: { idPengguna: userId }, // Gunakan userId dari state
        namaTarget: formData.namaTarget,
        targetNominal: parseCurrency(formData.targetNominal), // Pastikan angka, bukan string
        nominalSekarang: 0, // Default 0
        mataUang: "IDR",
        frekuensiPengisian: selectedPlan,
        nominalPengisian: parseCurrency(formData.nominalPengisian), // Pastikan angka, bukan string
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        status: "berjalan",
        catatan: formData.catatan || "",
        fotoTabungan: image,
      };

      console.log("Mengirim data:", payload);

<<<<<<< HEAD:src/screens/TabunganScreen.jsx
      const response = await api.post("/target-tabungan", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      });
=======
      const response = await axios.post(
        `${BASE_URL}/target-tabungan`,
        payload,
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000
        }
      );
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/TabunganScreen.jsx

      console.log("Response:", response.data);

      if (response.data && response.data.code === 200) {
        Alert.alert("Sukses", "Tabungan berhasil dibuat!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Gagal menyimpan tabungan"
        );
      }
    } catch (error) {
      console.error("Error saving tabungan:", error);

      if (error.response) {
        Alert.alert(
          "Error",
          `Gagal menyimpan tabungan: ${
            error.response.data.message || error.response.status
          }`
        );
      } else if (error.request) {
        Alert.alert(
          "Network Error",
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        );
      } else {
        Alert.alert("Error", "Terjadi kesalahan: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk menghitung nominal otomatis ketika target atau tanggal berubah
  React.useEffect(() => {
    if (formData.targetNominal && formData.tanggalSelesai) {
      calculateAutoNominal();
    }
  }, [formData.targetNominal, formData.tanggalSelesai, selectedPlan]);

  // Calendar Component
  const CalendarModal = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(currentMonth);
      const firstDay = getFirstDayOfMonth(currentMonth);
      const days = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonth.getFullYear()}-${(
          currentMonth.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        const isSelected = formData.tanggalSelesai === dateStr;
        const isToday = dateStr === new Date().toISOString().split("T")[0];

        days.push(
          <TouchableOpacity
            key={day}
            style={[
              styles.calendarDay,
              isSelected && styles.calendarDaySelected,
              isToday && styles.calendarDayToday,
            ]}
            onPress={() => {
              handleInputChange("tanggalSelesai", dateStr);
              setShowDatePicker(false);
            }}
          >
            <Text
              style={[
                styles.calendarDayText,
                isSelected && styles.calendarDayTextSelected,
                isToday && styles.calendarDayTextToday,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        );
      }

      return days;
    };

    const goToPreviousMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    };

    const goToNextMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );
    };

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return (
      <Modal visible={showDatePicker} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goToPreviousMonth}>
                <Ionicons name="chevron-back" size={24} color="#2691B5" />
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </Text>

              <TouchableOpacity onPress={goToNextMonth}>
                <Ionicons name="chevron-forward" size={24} color="#2691B5" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekdays}>
              {["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"].map((day) => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarDays}>{renderCalendar()}</View>

            <View style={styles.calendarButtons}>
              <TouchableOpacity
                style={[styles.calendarButton, styles.cancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>BATAL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.calendarButton, styles.okButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.okButtonText}>OKE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Memuat data pengguna...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
<<<<<<< HEAD:src/screens/TabunganScreen.jsx
=======
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buat Tabungan Baru</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveTabungan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>Simpan</Text>
          )}
        </TouchableOpacity>
      </View>
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/TabunganScreen.jsx

    
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Upload Gambar */}
        <Text style={styles.sectionTitle}>Foto Tabungan (Opsional)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.uploadedImage} />
          ) : (
            <>
              <Ionicons name="image-outline" size={50} color="#2691B5" />
              <Ionicons
                name="add-circle"
                size={20}
                color="#2691B5"
                style={styles.addIcon}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Nama Tabungan */}
        <Text style={styles.sectionTitle}>Nama Tabungan</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="pricetag-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Contoh: Tabungan Liburan"
            placeholderTextColor="#9CA3AF"
            value={formData.namaTarget}
            onChangeText={(text) => handleInputChange("namaTarget", text)}
          />
        </View>

        {/* Target Tabungan */}
        <Text style={styles.sectionTitle}>Target Tabungan</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={formData.targetNominal}
            onChangeText={(text) =>
              handleInputChange("targetNominal", formatCurrency(text))
            }
          />
          <Text style={styles.currencyText}>Rp</Text>
        </View>

        {/* Mata Uang */}
        <Text style={styles.sectionTitle}>Mata Uang</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="flag-outline" size={20} color="#64748B" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value="Indonesia Rupiah (IDR)"
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </View>

        {/* Tanggal Mulai */}
        <Text style={styles.sectionTitle}>Tanggal Mulai</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="calendar-outline" size={20} color="#64748B" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.tanggalMulai}
            editable={false}
          />
        </View>

        {/* Tanggal Selesai */}
        <Text style={styles.sectionTitle}>Tanggal Selesai</Text>
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#64748B" />
          <TextInput
            style={[
              styles.input,
              !formData.tanggalSelesai && styles.placeholderText,
            ]}
            placeholder="Pilih tanggal selesai"
            placeholderTextColor="#9CA3AF"
            value={formData.tanggalSelesai}
            editable={false}
            pointerEvents="none"
          />
          <Ionicons name="calendar" size={18} color="#2691B5" />
        </TouchableOpacity>

        {/* Rencana Pengisian */}
        <Text style={styles.sectionTitle}>Rencana Pengisian</Text>
        <View style={styles.planContainer}>
          {[
            { key: "harian", label: "Harian" },
            { key: "mingguan", label: "Mingguan" },
            { key: "bulanan", label: "Bulanan" },
          ].map((plan) => (
            <TouchableOpacity
              key={plan.key}
              style={[
                styles.planButton,
                selectedPlan === plan.key && styles.planButtonActive,
              ]}
              onPress={() => setSelectedPlan(plan.key)}
            >
              <Text
                style={[
                  styles.planText,
                  selectedPlan === plan.key && styles.planTextActive,
                ]}
              >
                {plan.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nominal Pengisian */}
        <Text style={styles.sectionTitle}>Nominal Pengisian</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="wallet-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={formData.nominalPengisian}
            onChangeText={(text) =>
              handleInputChange("nominalPengisian", formatCurrency(text))
            }
          />
          <Text style={styles.currencyText}>Rp</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#2691B5"
          />
          <Text style={styles.infoText}>
            Nominal pengisian akan dihitung otomatis berdasarkan target,
            tanggal, dan frekuensi yang dipilih
          </Text>
        </View>

        {/* Catatan */}
        <Text style={styles.sectionTitle}>Catatan (Opsional)</Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tambahkan catatan..."
            placeholderTextColor="#9CA3AF"
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
            value={formData.catatan}
            onChangeText={(text) => handleInputChange("catatan", text)}
          />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2691B5"
          />
          <Text style={styles.infoText}>
            Tabungan akan secara otomatis menampilkan progress menuju target
            yang ditentukan.
          </Text>
        </View>
      </ScrollView>

<<<<<<< HEAD:src/screens/TabunganScreen.jsx
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={saveTabungan}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveText}>Simpan</Text>
        )}
      </TouchableOpacity>

      <View style={styles.header}></View>

=======
>>>>>>> 920285b9a195a19258e7dbb97f35db3dfd3942e7:src/screens/user/Tabungan/TabunganScreen.jsx
      <CalendarModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2691B5",
  },
  userInfo: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2691B5",
  },
  userInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2691B5",
  },
  userIdText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#2691B5",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginVertical: 8,
    color: "#2691B5",
    marginTop: 15,
  },
  uploadBox: {
    backgroundColor: "#E2E8F0",
    height: 130,
    borderRadius: 10,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  addIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  disabledInput: {
    color: "#64748B",
    backgroundColor: "#F8FAFC",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  currencyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  planContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    marginBottom: 15,
    padding: 3,
  },
  planButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  planButtonActive: {
    backgroundColor: "#2691B5",
  },
  planText: {
    color: "#1E293B",
    fontWeight: "500",
    fontSize: 13,
  },
  planTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  textAreaWrapper: {
    alignItems: "flex-start",
    minHeight: 80,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E1F5FE",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: "#0277BD",
    lineHeight: 16,
  },
  // Calendar Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2691B5",
  },
  calendarWeekdays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2691B5",
    width: 40,
    textAlign: "center",
  },
  calendarDays: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  calendarDay: {
    width: "14.28%",
    alignItems: "center",
    padding: 8,
    marginVertical: 2,
  },
  calendarDaySelected: {
    backgroundColor: "#2691B5",
    borderRadius: 20,
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: "#2691B5",
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: "#333",
  },
  calendarDayTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  calendarDayTextToday: {
    color: "#2691B5",
    fontWeight: "600",
  },
  calendarButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calendarButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
  },
  okButton: {
    backgroundColor: "#2691B5",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
  },
  okButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
