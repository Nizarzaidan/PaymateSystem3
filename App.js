import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import RegisterScreen from "./src/screens/RegisterScreen";
import Dashboard from "./src/screens/Dashboard";
import TambahTransaksi from "./src/screens/TambahTransaksi";
import TabunganScreen from "./src/screens/TabunganScreen";
import LihatTabunganScreen from "./src/screens/LihatTabunganScreen"; // BARU
import TambahTagihanScreen from "./src/screens/TambahTagihanScreen";
import TagihanScreen from "./src/screens/TagihanScreen";
import RiwayatScreen from "./src/screens/RiwayatScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RegisterScreen">
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
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
          name="RiwayatScreen"
          component={RiwayatScreen}
          options={{ title: "Riwayat" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}