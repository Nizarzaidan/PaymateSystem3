import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BASE_URL } from "../../api/apiClient";

const RegisterScreen = ({ navigation }) => {
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState(""); // Ganti dari kataSandiHash
  const [telepon, setTelepon] = useState("");
  const [namaPanggilan, setNamaPanggilan] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = `${BASE_URL}/pengguna`;

  return (
    <LinearGradient colors={["#6FA9FF", "#A0C4FF"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Daftar Akun Baru</Text>
          <Text style={styles.subtitle}>
            Silakan isi data diri Anda!
          </Text>

          {/* Nama Lengkap */}
          <Text style={styles.label}>Nama Lengkap *</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama lengkap"
            value={namaLengkap}
            onChangeText={setNamaLengkap}
            editable={!isLoading}
          />

          {/* Email */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimal 6 karakter"
            value={kataSandi}
            onChangeText={setKataSandi}
            secureTextEntry
            editable={!isLoading}
          />

          {/* Telepon */}
          <Text style={styles.label}>Telepon</Text>
          <TextInput
            style={styles.input}
            placeholder="Nomor telepon"
            value={telepon}
            onChangeText={setTelepon}
            keyboardType="phone-pad"
            editable={!isLoading}
          />

          {/* Nama Panggilan */}
          <Text style={styles.label}>Nama Panggilan</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama panggilan"
            value={namaPanggilan}
            onChangeText={setNamaPanggilan}
            editable={!isLoading}
          />

          {/* Jenis Kelamin - COMBO BOX */}
          <Text style={styles.label}>Jenis Kelamin</Text>
          <TouchableOpacity
            style={[styles.pickerTrigger, isLoading && styles.disabled]}
            onPress={() => {
              if (!isLoading) {
                setShowGenderPicker(true);
              }
            }}
            disabled={isLoading}
          >
            <Text style={[
              styles.pickerTriggerText,
              !jenisKelamin && styles.placeholderText
            ]}>
              {jenisKelamin === "L" ? "Laki-laki" : jenisKelamin === "P" ? "Perempuan" : "Pilih Jenis Kelamin"}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>

          {/* Modal Picker untuk Jenis Kelamin */}
          <Modal
            visible={showGenderPicker}
            transparent={true}
            animationType="slide"
          >
            <TouchableWithoutFeedback onPress={() => setShowGenderPicker(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Pilih Jenis Kelamin</Text>
                  
                  <TouchableOpacity 
                    style={[
                      styles.genderOption,
                      jenisKelamin === "L" && styles.genderOptionSelected
                    ]}
                    onPress={() => {
                      setJenisKelamin("L");
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      jenisKelamin === "L" && styles.genderOptionTextSelected
                    ]}>Laki-laki</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.genderOption,
                      jenisKelamin === "P" && styles.genderOptionSelected
                    ]}
                    onPress={() => {
                      setJenisKelamin("P");
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      jenisKelamin === "P" && styles.genderOptionTextSelected
                    ]}>Perempuan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowGenderPicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Batal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Tanggal Lahir - KALENDER */}
          <Text style={styles.label}>Tanggal Lahir</Text>
          <TouchableOpacity
            style={[styles.dateInput, isLoading && styles.disabled]}
            onPress={() => {
              if (!isLoading) {
                setShowDatePicker(true);
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.dateText}>
              {tanggalLahir.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={tanggalLahir}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setTanggalLahir(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}

          {/* Informasi Peran Otomatis */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Peran akan otomatis diatur sebagai <Text style={styles.infoBold}>"user"</Text>
            </Text>
          </View>

          {/* Tombol Daftar */}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={async () => {
              // Validasi input
              if (!namaLengkap || !email || !kataSandi) {
                Alert.alert("Error", "Nama lengkap, email, dan password wajib diisi!");
                return;
              }

              // Validasi email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(email)) {
                Alert.alert("Error", "Format email tidak valid!");
                return;
              }

              // Validasi password minimal 6 karakter
              if (kataSandi.length < 6) {
                Alert.alert("Error", "Password minimal 6 karakter!");
                return;
              }

              setIsLoading(true);

              try {
                // Format payload sesuai dengan entity Pengguna di backend
                const payload = {
                  namaLengkap: namaLengkap,
                  email: email,
                  kataSandiHash: kataSandi, // Sesuai dengan field di entity Pengguna
                  telepon: telepon || null,
                  namaPanggilan: namaPanggilan || null,
                  jenisKelamin: jenisKelamin || null,
                  tanggalLahir: tanggalLahir.toISOString(),
                  // Field berikut akan dihandle otomatis oleh backend:
                  // - idPengguna (auto increment)
                  // - tanggalDaftar (auto set ke sekarang)
                  // - peran (auto set ke "user")
                  // - statusAktif (auto set ke true)
                };

                console.log("Mengirim data registrasi:", payload);

                const response = await axios.post(API_URL, payload);
                
                console.log("Response dari backend:", response.data);
                
                if (response.data && response.data.code === 200) {
                  Alert.alert(
                    "Sukses", 
                    "Registrasi berhasil! Silakan login.",
                    [
                      {
                        text: "OK",
                        onPress: () => navigation.navigate("LoginScreen")
                      }
                    ]
                  );
                } else {
                  Alert.alert("Gagal", response.data.message || "Terjadi kesalahan saat registrasi.");
                }
              } catch (error) {
                console.error("Error registrasi:", error);
                console.error("Error details:", error.response?.data);
                
                if (error.response) {
                  // Server responded with error status
                  if (error.response.status === 400) {
                    Alert.alert("Error", "Email sudah terdaftar!");
                  } else if (error.response.data && error.response.data.message) {
                    Alert.alert("Error", error.response.data.message);
                  } else {
                    Alert.alert("Error", `Terjadi kesalahan: ${error.response.status}`);
                  }
                } else if (error.request) {
                  // Request was made but no response received
                  Alert.alert("Error", "Tidak bisa terhubung ke server. Periksa koneksi internet Anda.");
                } else {
                  // Something else happened
                  Alert.alert("Error", "Terjadi kesalahan tidak terduga.");
                }
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Mendaftarkan..." : "Daftar"}
            </Text>
          </TouchableOpacity>

          {/* Tombol Reset */}
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setNamaLengkap("");
              setEmail("");
              setKataSandi("");
              setTelepon("");
              setNamaPanggilan("");
              setJenisKelamin("");
              setTanggalLahir(new Date());
            }}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>Reset Form</Text>
          </TouchableOpacity>

          {/* Link ke Login */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate("LoginScreen")}
            disabled={isLoading}
          >
            <Text style={styles.loginText}>
              Sudah punya akun? <Text style={styles.loginTextBold}>Login di sini</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#008CFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    fontSize: 14,
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  // Styles untuk Combo Box Jenis Kelamin
  pickerTrigger: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerTriggerText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  dropdownIcon: {
    color: "#666",
    fontSize: 12,
  },
  // Styles untuk Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  genderOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  genderOptionSelected: {
    backgroundColor: "#e6f2ff",
    borderRadius: 8,
  },
  genderOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  genderOptionTextSelected: {
    color: "#008CFF",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  // Styles untuk Date Input
  dateInput: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  // Styles untuk Info Box
  infoBox: {
    backgroundColor: "#e6f2ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#008CFF",
  },
  infoText: {
    color: "#0066cc",
    fontSize: 12,
  },
  infoBold: {
    fontWeight: "bold",
  },
  // Styles untuk Button
  button: {
    backgroundColor: "#6FA9FF",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Reset Button
  resetButton: {
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    color: "#666",
    fontSize: 14,
  },
  // Styles untuk Login Link
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginTextBold: {
    color: "#008CFF",
    fontWeight: "bold",
  },
});