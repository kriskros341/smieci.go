import { useAuth, useUser } from "@clerk/clerk-expo";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Layout() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded || !isSignedIn) {
    return (
      <View className="flex-1">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <Tabs
      initialRouteName="map"
      screenOptions={{
        tabBarActiveTintColor: "#10a37f",
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          headerTitleContainerStyle: {
            display: "none",
          },
          tabBarIcon: ({ color }) => (
            <Entypo name="map" size={24} color={color} />
          ),
          href: "/tabs/map",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="leaderboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: user?.username ?? "",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-box" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen redirect name="index" />
    </Tabs>
  );
}
