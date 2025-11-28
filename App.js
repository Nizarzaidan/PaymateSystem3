import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { TabunganProvider } from './src/contexts/TabunganContext';
//tampilan awal
import SplashScreen1 from "./src/screens/auth/SplashScreen1";
import SplashScreenGrow from "./src/screens/auth/SplashScreenGrow";
import LandingStartScreen from "./src/screens/auth/LandingStartScreen";
import SplashScreen2 from "./src/screens/auth/SplashScreen2";
import SelectionScreen from "./src/screens/auth/SelectionScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";


import Dashboard from "./src/screens/user/dashboard/Dashboard";
import TambahTransaksi from "./src/screens/user/Transaksi/TambahTransaksi";
import TabunganScreen from "./src/screens/user/Tabungan/TabunganScreen";
import LihatTabunganScreen from "./src/screens/user/Tabungan/LihatTabunganScreen"; // BARU
import EditTabunganScreen from "./src/screens/user/Tabungan/EditTabunganScreen"; // BARU
import SampahTabunganScreen from "./src/screens/user/Tabungan/SampahTabunganScreen"; // BARU
import TambahTagihanScreen from "./src/screens/user/Tagihan/TambahTagihanScreen";
import TagihanScreen from "./src/screens/user/Tagihan/TagihanScreen";
import EditTagihanScreen from "./src/screens/user/Tagihan/EditTagihanScreen";
import RiwayatScreen from "./src/screens/user/Transaksi/RiwayatScreen";
import ProfileScreen from "./src/screens/user/Profile/ProfileScreen";
import KelolaAkun from "./src/screens/user/Profile/KelolaAkun";
import LeaderboardScreen from "./src/screens/user/Profile/LeaderboardScreen";
import KelolaKategori from "./src/screens/user/Profile/KelolaKategori";
import RewardTarget from "./src/screens/user/Profile/RewardTarget";
import SampahTagihanScreen from "./src/screens/user/Tagihan/SampahTagihanScreen";
const Stack = createStackNavigator();

export default function App() {
  return (
    <TabunganProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash1"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash1" component={SplashScreen1} />
        <Stack.Screen name="SplashGrow" component={SplashScreenGrow} />
        <Stack.Screen name="LandingStart" component={LandingStartScreen} />
        <Stack.Screen name="Splash2" component={SplashScreen2} />
        <Stack.Screen name="SelectionScreen" component={SelectionScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TambahTransaksi"
          component={TambahTransaksi}
          options={{ title: "Tambah Transaksi" }}
        />
        <Stack.Screen
          name="TabunganScreen"
          component={TabunganScreen}
          options={{ title: "Buat Tabungan" }}
        />
        {/* ROUTE BARU */}
        <Stack.Screen
          name="LihatTabunganScreen"
          component={LihatTabunganScreen}
          options={{ title: "Daftar Tabungan" }}
        />
        {/* ROUTE BARU */}
        <Stack.Screen
          name="EditTabunganScreen"
          component={EditTabunganScreen}
          options={{ title: "Edit Tabungan" }}
        />
         {/* ROUTE BARU */}
        <Stack.Screen
          name="SampahTabunganScreen"
          component={SampahTabunganScreen}
          options={{ title: "Sampah Tabungan" }}
        />
        <Stack.Screen 
          name="ProfileScreen" 
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="LeaderboardScreen" 
          component={LeaderboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TambahTagihanScreen"
          component={TambahTagihanScreen}
          options={{ title: "Tambah Tagihan" }}
        />
        <Stack.Screen
          name="TagihanScreen"
          component={TagihanScreen}
          options={{ title: "Tagihan" }}
        />
        <Stack.Screen
          name="EditTagihanScreen"
          component={EditTagihanScreen}
          options={{ title: "Edit Tagihan" }}
        />
        <Stack.Screen
  name="SampahTagihanScreen"
  component={SampahTagihanScreen}
  options={{ headerShown: false }}
/>
        <Stack.Screen
          name="RiwayatScreen"
          component={RiwayatScreen}
          options={{ title: "Riwayat" }}
        />
        <Stack.Screen
          name="KelolaAkun"
          component={KelolaAkun}
          options={{ title: "Akun" }}
        />
        <Stack.Screen
          name="KelolaKategori"
          component={KelolaKategori}
          options={{ title: "Kategori" }}
        />
        <Stack.Screen
          name="RewardTarget"
          component={RewardTarget}
          options={{ title: "Reward" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </TabunganProvider>
  );
}