import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import Routes from "./src/routes";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore warnings

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="black" />
      <Routes />
    </NavigationContainer>
  );
}
