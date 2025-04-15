import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import Main from "./pages/main";
import Login from "./pages/login";
import CardDetail from "./pages/card";
import CadastrarUsuario from "./pages/cadastro";

const Stack = createStackNavigator();

const screenOptions = {
  headerTitleAlign: "center",
  headerStyle: {
    backgroundColor: "#7159c1",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
};

export default function Routes() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          title: "YU-GI-OH CARDS",
          headerLeft: () => null,
        }}
      />
      
      <Stack.Screen
        name="CadastrarUsuario"
        component={CadastrarUsuario}
        options={{
          title: "CADASTRO",
        }}
      />
      
      <Stack.Screen
        name="Main"
        component={Main}
        options={({ navigation }) => ({
          title: "MINHAS CARTAS",
          headerLeft: () => null,
          headerRight: () => (
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#fff"
              style={{ marginRight: 15 }}
              onPress={async () => {
                try {
                  navigation.replace("Login");
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
            />
          ),
        })}
      />
      
      <Stack.Screen
        name="CardDetail"
        component={CardDetail}
        options={{
          title: "DETALHES DA CARTA",
        }}
      />
    </Stack.Navigator>
  );
}