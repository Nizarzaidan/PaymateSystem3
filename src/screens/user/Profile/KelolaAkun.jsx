import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { BASE_URL } from "../../../api/apiClient";

export default function KelolaAkunScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Gender picker state
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Image state
  const [selectedImage, setSelectedImage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    telepon: "",
    namaPanggilan: "",
    jenisKelamin: "",
    tanggalLahir: "",
    fotoProfil: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const data = JSON.parse(userDataString);
        setUserData(data);
        
        // PERBAIKAN: Handle semua kemungkinan field name
        const namaLengkap = data.nama_lengkap || data.namaLengkap || "";
        const email = data.email || "";
        const telepon = data.telepon || "";
        const namaPanggilan = data.nama_panggilan || data.namaPanggilan || "";
        const jenisKelamin = data.jenis_kelamin || data.jenisKelamin || "";
        const tanggalLahir = data.tanggal_lahir || data.tanggalLahir || "";
        const fotoProfil = data.foto_profil || data.fotoProfil || "";

        console.log("Loaded user data:", {
          namaLengkap, email, telepon, namaPanggilan, jenisKelamin, tanggalLahir, fotoProfil
        });

        setFormData({
          namaLengkap,
          email,
          telepon,
          namaPanggilan,
          jenisKelamin,
          tanggalLahir,
          fotoProfil,
        });

        if (tanggalLahir) {
          setSelectedDate(new Date(tanggalLahir));
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Gagal memuat data pengguna");
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.namaLengkap.trim()) {
      Alert.alert("Error", "Nama lengkap tidak boleh kosong");
      return;
    }

    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem("jwtToken");
      const userDataString = await AsyncStorage.getItem("userData");
      const currentUserData = JSON.parse(userDataString);
      
      // Upload foto profil terlebih dahulu jika ada gambar baru
      let fotoProfilUrl = formData.fotoProfil;
      if (selectedImage && selectedImage !== formData.fotoProfil) {
        console.log("Uploading new image...");
        fotoProfilUrl = await uploadImage(selectedImage);
        console.log("Image uploaded, URL:", fotoProfilUrl);
      }

      const updateData = {
        idPengguna: currentUserData.id_pengguna || currentUserData.idPengguna,
        namaLengkap: formData.namaLengkap,
        telepon: formData.telepon,
        namaPanggilan: formData.namaPanggilan,
        jenisKelamin: formData.jenisKelamin,
        tanggalLahir: formData.tanggalLahir ? new Date(formData.tanggalLahir).toISOString() : null,
        fotoProfil: fotoProfilUrl,
      };

      console.log("Updating profile with data:", updateData);

      const response = await axios.put(
        `${BASE_URL}/pengguna`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Update response:", response.data);

      if (response.data.code === 200 || response.status === 200) {
        // PERBAIKAN: Simpan data dengan kedua format (camelCase dan snake_case)
        const updatedUserData = {
          ...currentUserData,
          // camelCase
          namaLengkap: formData.namaLengkap,
          telepon: formData.telepon,
          namaPanggilan: formData.namaPanggilan,
          jenisKelamin: formData.jenisKelamin,
          tanggalLahir: formData.tanggalLahir,
          fotoProfil: fotoProfilUrl,
          // snake_case (untuk kompatibilitas)
          nama_lengkap: formData.namaLengkap,
          nama_panggilan: formData.namaPanggilan,
          jenis_kelamin: formData.jenisKelamin,
          tanggal_lahir: formData.tanggalLahir,
          foto_profil: fotoProfilUrl,
        };
        
        console.log("Saving updated user data:", updatedUserData);
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
        
        setUserData(updatedUserData);
        setEditing(false);
        setSelectedImage(null);
        
        Alert.alert("Sukses", "Profil berhasil diperbarui");
      } else {
        Alert.alert("Error", response.data.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Update error:", error);
      console.error("Error response:", error.response?.data);
      Alert.alert("Error", error.response?.data?.message || "Terjadi kesalahan saat memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploadingImage(true);
      console.log("Starting image upload...");
      
      // PERBAIKAN: Jika tidak ada endpoint upload, simpan sebagai base64 atau return URI
      // Untuk sementara, kita return URI asli karena mungkin backend belum ada endpoint upload
      console.log("No upload endpoint, returning original URI");
      return imageUri;
      
      // Kode di bawah ini untuk ketika backend sudah siap
      /*
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      const token = await AsyncStorage.getItem("jwtToken");
      
      const response = await axios.post(
        `${BASE_URL}/upload/foto-profil`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.url) {
        return response.data.url;
      }
      
      return imageUri; // Fallback jika upload gagal
      */
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Info", "Foto profil disimpan secara lokal");
      return imageUri;
    } finally {
      setUploadingImage(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin diperlukan', 'Izin akses galeri diperlukan untuk mengubah foto profil');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          fotoProfil: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Gagal memilih gambar");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
      handleChange('tanggalLahir', selectedDate.toISOString());
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Pilih tanggal lahir";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return "Pilih tanggal lahir";
    }
  };

  const getImageSource = () => {
    // Prioritaskan selectedImage (gambar baru), lalu formData.fotoProfil
    return selectedImage || formData.fotoProfil;
  };

  const GenderPickerModal = () => (
    <Modal
      visible={showGenderPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowGenderPicker(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Jenis Kelamin</Text>
            <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.genderOption}
            onPress={() => {
              handleChange('jenisKelamin', 'L'); // PERBAIKAN: Gunakan 'L' dan 'P' sesuai backend
              setShowGenderPicker(false);
            }}
          >
            <Ionicons name="male" size={24} color="#2691B5" />
            <Text style={styles.genderText}>Pria</Text>
            {formData.jenisKelamin === 'L' && (
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.genderOption}
            onPress={() => {
              handleChange('jenisKelamin', 'P'); // PERBAIKAN: Gunakan 'L' dan 'P' sesuai backend
              setShowGenderPicker(false);
            }}
          >
            <Ionicons name="female" size={24} color="#EC4899" />
            <Text style={styles.genderText}>Wanita</Text>
            {formData.jenisKelamin === 'P' && (
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const getGenderDisplayText = () => {
    switch (formData.jenisKelamin) {
      case 'L': return 'Pria';
      case 'P': return 'Wanita';
      default: return "Pilih jenis kelamin";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2691B5" barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Akun</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FOTO PROFIL */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={editing ? pickImage : null}>
            <View style={styles.photoContainer}>
              {getImageSource() ? (
                <Image 
                  source={{ uri: getImageSource() }} 
                  style={styles.profileImage}
                  onError={(error) => console.log("Image load error:", error.nativeEvent.error)}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="person" size={40} color="#2691B5" />
                </View>
              )}
              {editing && (
                <View style={styles.editPhotoBadge}>
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={16} color="#fff" />
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
          {editing && <Text style={styles.photoText}>Tap untuk mengubah foto</Text>}
        </View>

        {/* FORM EDIT */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput
              style={styles.input}
              value={formData.namaLengkap}
              onChangeText={(value) => handleChange('namaLengkap', value)}
              placeholder="Masukkan nama lengkap"
              editable={editing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.email}
              editable={false}
              placeholder="Email"
            />
            <Text style={styles.note}>Email tidak dapat diubah</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={styles.input}
              value={formData.telepon}
              onChangeText={(value) => handleChange('telepon', value)}
              placeholder="Masukkan nomor telepon"
              keyboardType="phone-pad"
              editable={editing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Panggilan</Text>
            <TextInput
              style={styles.input}
              value={formData.namaPanggilan}
              onChangeText={(value) => handleChange('namaPanggilan', value)}
              placeholder="Masukkan nama panggilan"
              editable={editing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jenis Kelamin</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectInput]}
              onPress={() => editing && setShowGenderPicker(true)}
              disabled={!editing}
            >
              <Text style={formData.jenisKelamin ? styles.inputText : styles.placeholderText}>
                {getGenderDisplayText()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Lahir</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectInput]}
              onPress={() => editing && setShowDatePicker(true)}
              disabled={!editing}
            >
              <Text style={formData.tanggalLahir ? styles.inputText : styles.placeholderText}>
                {formatDateForDisplay(formData.tanggalLahir)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionContainer}>
          {!editing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profil</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  setSelectedImage(null);
                  loadUserData(); // Reload data dari AsyncStorage
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={loading || uploadingImage}
              >
                {(loading || uploadingImage) ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Simpan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1940, 0, 1)}
        />
      )}

      {/* Gender Picker Modal */}
      <GenderPickerModal />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  photoSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#2691B5",
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#2691B5",
  },
  editPhotoBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#2691B5",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  photoText: {
    color: "#6B7280",
    fontSize: 14,
  },
  formContainer: {
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#111827",
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    color: "#111827",
    fontSize: 16,
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  note: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
  },
  actionContainer: {
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: "#2691B5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  genderText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 15,
    flex: 1,
  },
});