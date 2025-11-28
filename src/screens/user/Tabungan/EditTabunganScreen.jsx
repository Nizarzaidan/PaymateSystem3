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
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";
import { useTabungan } from "../../../contexts/TabunganContext";

export default function EditTabunganScreen({ navigation, route }) {
  const { tabunganId } = route.params;
  const { updateTabungan, calculateProgress, isTargetCompleted, fetchTabungan } = useTabungan();
  
  const [selectedPlan, setSelectedPlan] = useState("harian");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const [formData, setFormData] = useState({
    namaTarget: "",
    targetNominal: "",
    nominalPengisian: "",
    nominalSekarang: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    catatan: "",
    status: "",
  });

  const [jumlahHari, setJumlahHari] = useState(0);

  useEffect(() => {
    fetchTabunganDetail();
  }, []);

  // Hitung jumlah hari antara tanggal mulai dan selesai
  const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = end.getTime() - start.getTime();
    return Math.ceil(difference / (1000 * 3600 * 24));
  };

  // Hitung nominal pengisian berdasarkan periode
  const calculateNominalPengisian = (targetNominal, period, days) => {
    if (!targetNominal || !days || days <= 0) return 0;

    const target = parseCurrency(targetNominal);
    
    switch (period) {
      case "harian":
        return Math.ceil(target / days);
      
      case "mingguan":
        const weeks = days / 7;
        return Math.ceil(target / weeks);
      
      case "bulanan":
        const months = days / 30;
        return Math.ceil(target / months);
      
      default:
        return 0;
    }
  };

  // Update nominalPengisian ketika periode atau jumlah hari berubah
  useEffect(() => {
    if (jumlahHari > 0 && formData.targetNominal) {
      const calculatedNominal = calculateNominalPengisian(
        formData.targetNominal,
        selectedPlan,
        jumlahHari
      );
      
      setFormData(prev => ({
        ...prev,
        nominalPengisian: formatCurrency(calculatedNominal.toString())
      }));
    }
  }, [selectedPlan, jumlahHari, formData.targetNominal]);

  // Fetch detail tabungan
  const fetchTabunganDetail = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/target-tabungan/${tabunganId}`
      );

      if (response.data) {
        const data = response.data;
        
        // Hitung jumlah hari
        const days = calculateDaysBetween(data.tanggalMulai, data.tanggalSelesai);
        setJumlahHari(days);

        // Check if target is 100% completed (LOCKED)
        const progress = calculateProgress(data.nominalSekarang, data.targetNominal);
        const locked = progress >= 100 || data.status === 'selesai';
        setIsLocked(locked);

        // Show warning if locked
        if (locked) {
          Alert.alert(
            "📌 Tabungan Terkunci",
            `Tabungan "${data.namaTarget}" sudah mencapai 100% dan tidak dapat diedit.\n\nKamu hanya bisa melihat detailnya.`,
            [{ 
              text: "Kembali", 
              onPress: () => navigation.goBack() 
            }]
          );
        }

        setFormData({
          namaTarget: data.namaTarget,
          targetNominal: formatCurrency(data.targetNominal.toString()),
          nominalSekarang: formatCurrency(data.nominalSekarang.toString()),
          nominalPengisian: formatCurrency(data.nominalPengisian.toString()),
          tanggalMulai: data.tanggalMulai,
          tanggalSelesai: data.tanggalSelesai,
          catatan: data.catatan || "",
          status: data.status,
        });
        setSelectedPlan(data.frekuensiPengisian);
        setImage(data.fotoTabungan);
      }
    } catch (error) {
      console.error("Error fetching tabungan:", error);
      Alert.alert("Error", "Gagal memuat data tabungan");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Pick image
  const pickImage = async () => {
    if (isLocked) {
      Alert.alert("Tidak Dapat Diedit", "Tabungan sudah mencapai 100%");
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Izin Ditolak", "Izinkan aplikasi mengakses galeri.");
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
    if (isLocked && field !== 'catatan') {
      Alert.alert("Tidak Dapat Diedit", "Tabungan sudah mencapai 100%");
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle tanggal selesai change
  const handleTanggalSelesaiChange = (date) => {
    if (isLocked) {
      Alert.alert("Tidak Dapat Diedit", "Tabungan sudah mencapai 100%");
      return;
    }

    const days = calculateDaysBetween(formData.tanggalMulai, date);
    setJumlahHari(days);
    
    setFormData(prev => ({
      ...prev,
      tanggalSelesai: date
    }));
  };

  // Format currency
  const formatCurrency = (value) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return "";
  };

  // Parse currency
  const parseCurrency = (value) => {
    return parseInt(value.replace(/\./g, "")) || 0;
  };

  // Validate form
  const validateForm = () => {
    if (isLocked) {
      Alert.alert("Tidak Dapat Diedit", "Tabungan sudah mencapai 100%");
      return false;
    }

    if (!formData.namaTarget.trim()) {
      Alert.alert("Error", "Nama tabungan harus diisi");
      return false;
    }
    
    const targetNominal = parseCurrency(formData.targetNominal);
    const nominalSekarang = parseCurrency(formData.nominalSekarang);

    if (!targetNominal || targetNominal <= 0) {
      Alert.alert("Error", "Target nominal harus diisi dan lebih dari 0");
      return false;
    }

    // IMPORTANT: Check if new target is less than current nominal
    if (targetNominal < nominalSekarang) {
      Alert.alert(
        "Peringatan",
        `Target baru (${formatCurrency(targetNominal)}) tidak boleh lebih kecil dari nominal terkumpul saat ini (${formatCurrency(nominalSekarang)}).\n\nSilakan masukkan target yang lebih besar.`
      );
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

    const startDate = new Date(formData.tanggalMulai);
    const endDate = new Date(formData.tanggalSelesai);
    if (endDate <= startDate) {
      Alert.alert("Error", "Tanggal selesai harus setelah tanggal mulai");
      return false;
    }

    if (jumlahHari <= 0) {
      Alert.alert("Error", "Periode tabungan harus lebih dari 0 hari");
      return false;
    }

    return true;
  };

  // Update tabungan with auto-recalculate percentage
  const updateTabunganData = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const newTargetNominal = parseCurrency(formData.targetNominal);
      const currentNominalSekarang = parseCurrency(formData.nominalSekarang);
      const nominalPengisian = parseCurrency(formData.nominalPengisian);

      // Auto-calculate new percentage based on new target
      const newProgress = (currentNominalSekarang / newTargetNominal) * 100;
      const newStatus = newProgress >= 100 ? 'selesai' : 'berjalan';

      const payload = {
        idTarget: tabunganId,
        namaTarget: formData.namaTarget,
        targetNominal: newTargetNominal,
        nominalSekarang: currentNominalSekarang,
        frekuensiPengisian: selectedPlan,
        nominalPengisian: nominalPengisian,
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        catatan: formData.catatan,
        fotoTabungan: image,
        status: newStatus,
      };

      const response = await axios.put(
        `${BASE_URL}/target-tabungan`,
        payload,
        { 
          headers: { 
            "Content-Type": "application/json",
          }
        }
      );

      if (response.data && response.data.code === 200) {
        // Real-time update via Context
        const updatedData = {
          ...payload,
          idTarget: tabunganId,
        };
        updateTabungan(updatedData);
        
        // Refresh to ensure sync
        await fetchTabungan();

        Alert.alert(
          "✅ Berhasil Diperbarui!", 
          `Target tabungan berhasil diubah!\n\nProgress baru: ${newProgress.toFixed(1)}%`,
          [
            { 
              text: "OK", 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        Alert.alert("Error", response.data.message || "Gagal memperbarui tabungan");
      }

    } catch (error) {
      console.error("Error updating tabungan:", error);
      Alert.alert("Error", "Gagal memperbarui tabungan");
    } finally {
      setSaving(false);
    }
  };

  // Calendar Modal Component
  const CalendarModal = () => {
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

      for (let i = 0; i < firstDay; i++) {
        days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        
        const isSelected = formData.tanggalSelesai === dateStr;
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        days.push(
          <TouchableOpacity
            key={day}
            style={[
              styles.calendarDay,
              isSelected && styles.calendarDaySelected,
              isToday && styles.calendarDayToday,
            ]}
            onPress={() => {
              if (!isLocked) {
                handleTanggalSelesaiChange(dateStr);
                setShowDatePicker(false);
              }
            }}
            disabled={isLocked}
          >
            <Text
              style={[
                styles.calendarDayText,
                isSelected && styles.calendarDayTextSelected,
                isToday && styles.calendarDayTextToday,
                isLocked && styles.calendarDayTextDisabled,
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
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return (
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goToPreviousMonth} disabled={isLocked}>
                <Ionicons name="chevron-back" size={24} color={isLocked ? "#CBD5E1" : "#2691B5"} />
              </TouchableOpacity>
              
              <Text style={styles.calendarTitle}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity onPress={goToNextMonth} disabled={isLocked}>
                <Ionicons name="chevron-forward" size={24} color={isLocked ? "#CBD5E1" : "#2691B5"} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekdays}>
              {["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"].map((day) => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarDays}>
              {renderCalendar()}
            </View>

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
                disabled={isLocked}
              >
                <Text style={[styles.okButtonText, isLocked && styles.okButtonTextDisabled]}>OKE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Tampilkan informasi periode
  const renderPeriodInfo = () => {
    if (!jumlahHari || jumlahHari <= 0) return null;

    let periodText = "";
    switch (selectedPlan) {
      case "harian":
        periodText = `${jumlahHari} hari`;
        break;
      case "mingguan":
        const weeks = Math.ceil(jumlahHari / 7);
        periodText = `${weeks} minggu (${jumlahHari} hari)`;
        break;
      case "bulanan":
        const months = Math.ceil(jumlahHari / 30);
        periodText = `${months} bulan (${jumlahHari} hari)`;
        break;
    }

    return (
      <View style={styles.periodInfoBox}>
        <Ionicons name="calendar" size={16} color="#2691B5" />
        <Text style={styles.periodInfoText}>
          Periode: {periodText}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2691B5" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Memuat data tabungan...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2691B5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isLocked ? "📌 Lihat Tabungan (Terkunci)" : "Edit Tabungan"}
        </Text>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (saving || isLocked) && styles.saveButtonDisabled
          ]}
          onPress={updateTabunganData}
          disabled={saving || isLocked}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              {isLocked ? "Terkunci 🔒" : "Simpan"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Lock Warning Banner */}
      {isLocked && (
        <View style={styles.lockBanner}>
          <Ionicons name="lock-closed" size={20} color="#10B981" />
          <Text style={styles.lockBannerText}>
            ✅ Target sudah tercapai 100%! Data tidak dapat diedit.
          </Text>
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Upload Gambar */}
        <Text style={styles.sectionTitle}>Foto Tabungan (Opsional)</Text>
        <TouchableOpacity 
          style={[styles.uploadBox, isLocked && styles.uploadBoxDisabled]} 
          onPress={pickImage}
          disabled={isLocked}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.uploadedImage} />
          ) : (
            <>
              <Ionicons name="image-outline" size={50} color={isLocked ? "#CBD5E1" : "#2691B5"} />
              {!isLocked && (
                <Ionicons
                  name="add-circle"
                  size={20}
                  color="#2691B5"
                  style={styles.addIcon}
                />
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Nama Tabungan */}
        <Text style={styles.sectionTitle}>Nama Tabungan</Text>
        <View style={[styles.inputWrapper, isLocked && styles.inputWrapperDisabled]}>
          <Ionicons name="pricetag-outline" size={20} color={isLocked ? "#CBD5E1" : "#64748B"} />
          <TextInput
            style={[styles.input, isLocked && styles.inputDisabled]}
            placeholder="Nama tabungan"
            placeholderTextColor="#9CA3AF"
            value={formData.namaTarget}
            onChangeText={(text) => handleInputChange('namaTarget', text)}
            editable={!isLocked}
          />
        </View>

        {/* Nominal Terkumpul (READ-ONLY) */}
        <Text style={styles.sectionTitle}>💰 Nominal Terkumpul</Text>
        <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
          <Ionicons name="wallet" size={20} color="#10B981" />
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={formData.nominalSekarang}
            editable={false}
          />
          <Text style={styles.currencyText}>Rp</Text>
        </View>

        {/* Target Tabungan */}
        <Text style={styles.sectionTitle}>Target Tabungan</Text>
        <View style={[styles.inputWrapper, isLocked && styles.inputWrapperDisabled]}>
          <Ionicons name="cash-outline" size={20} color={isLocked ? "#CBD5E1" : "#64748B"} />
          <TextInput
            style={[styles.input, isLocked && styles.inputDisabled]}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={formData.targetNominal}
            onChangeText={(text) => handleInputChange('targetNominal', formatCurrency(text))}
            editable={!isLocked}
          />
          <Text style={styles.currencyText}>Rp</Text>
        </View>

        {/* Progress Info */}
        {!isLocked && (
          <View style={styles.progressInfoBox}>
            <Ionicons name="information-circle" size={18} color="#2691B5" />
            <Text style={styles.progressInfoText}>
              Persentase akan otomatis menyesuaikan jika target diubah
            </Text>
          </View>
        )}

        {/* Tanggal Mulai */}
        <Text style={styles.sectionTitle}>Tanggal Mulai</Text>
        <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
          <Ionicons name="calendar-outline" size={20} color="#64748B" />
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={formData.tanggalMulai}
            editable={false}
          />
        </View>

        {/* Tanggal Selesai */}
        <Text style={styles.sectionTitle}>Tanggal Selesai</Text>
        <TouchableOpacity 
          style={[styles.inputWrapper, isLocked && styles.inputWrapperDisabled]}
          onPress={() => !isLocked && setShowDatePicker(true)}
          disabled={isLocked}
        >
          <Ionicons name="calendar-outline" size={20} color={isLocked ? "#CBD5E1" : "#64748B"} />
          <TextInput
            style={[styles.input, isLocked && styles.inputDisabled]}
            placeholder="Pilih tanggal selesai"
            placeholderTextColor="#9CA3AF"
            value={formData.tanggalSelesai}
            editable={false}
            pointerEvents="none"
          />
          <Ionicons name="calendar" size={18} color={isLocked ? "#CBD5E1" : "#2691B5"} />
        </TouchableOpacity>

        {/* Info Periode */}
        {renderPeriodInfo()}

        {/* Rencana Pengisian */}
        <Text style={styles.sectionTitle}>Rencana Pengisian</Text>
        <View style={[styles.planContainer, isLocked && styles.planContainerDisabled]}>
          {[
            { key: "harian", label: "Harian" },
            { key: "mingguan", label: "Mingguan" }, 
            { key: "bulanan", label: "Bulanan" }
          ].map((plan) => (
            <TouchableOpacity
              key={plan.key}
              style={[
                styles.planButton,
                selectedPlan === plan.key && styles.planButtonActive,
                isLocked && styles.planButtonDisabled,
              ]}
              onPress={() => !isLocked && setSelectedPlan(plan.key)}
              disabled={isLocked}
            >
              <Text
                style={[
                  styles.planText,
                  selectedPlan === plan.key && styles.planTextActive,
                  isLocked && styles.planTextDisabled,
                ]}
              >
                {plan.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nominal Pengisian (Auto-calculated) */}
        <Text style={styles.sectionTitle}>Nominal Pengisian</Text>
        <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
          <Ionicons name="wallet-outline" size={20} color="#64748B" />
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={formData.nominalPengisian}
            editable={false}
          />
          <Text style={styles.currencyText}>Rp</Text>
        </View>

        {/* Info Perhitungan Otomatis */}
        {!isLocked && jumlahHari > 0 && (
          <View style={styles.calculationInfoBox}>
            <Ionicons name="calculator" size={16} color="#10B981" />
            <Text style={styles.calculationInfoText}>
              Nominal dihitung otomatis: {formatCurrency(formData.targetNominal)} ÷ {
                selectedPlan === "harian" ? jumlahHari + " hari" :
                selectedPlan === "mingguan" ? Math.ceil(jumlahHari / 7) + " minggu" :
                Math.ceil(jumlahHari / 30) + " bulan"
              }
            </Text>
          </View>
        )}

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
            onChangeText={(text) => setFormData(prev => ({ ...prev, catatan: text }))}
            editable={true}
          />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2691B5" />
          <Text style={styles.infoText}>
            {isLocked 
              ? "Tabungan sudah mencapai 100% dan tidak dapat diedit. Selamat! 🎉" 
              : "Perubahan akan langsung diterapkan dan persentase akan otomatis menyesuaikan."}
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2691B5",
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
  lockBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 10,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  lockBannerText: {
    flex: 1,
    fontSize: 14,
    color: "#065F46",
    fontWeight: "600",
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
  uploadBoxDisabled: {
    opacity: 0.5,
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
  inputWrapperDisabled: {
    backgroundColor: "#F8FAFC",
    opacity: 0.7,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  inputDisabled: {
    color: "#64748B",
  },
  currencyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  progressInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  progressInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#0369A1",
  },
  periodInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    gap: 6,
  },
  periodInfoText: {
    fontSize: 12,
    color: "#0369A1",
    fontWeight: "500",
  },
  calculationInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    gap: 6,
  },
  calculationInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#065F46",
  },
  planContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    marginBottom: 15,
    padding: 3,
  },
  planContainerDisabled: {
    opacity: 0.5,
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
  planButtonDisabled: {
    opacity: 0.6,
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
  planTextDisabled: {
    color: "#94A3B8",
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
  calendarDayTextDisabled: {
    color: "#CBD5E1",
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
  okButtonTextDisabled: {
    color: "#CBD5E1",
  },
});