import { View, ActivityIndicator } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Tabs } from "expo-router";
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Layout() {
  const { user } = useUser();
  const { sessionId } = useAuth();
  const { isLoaded, isSignedIn } = useAuth();
  console.log({ sessionId });
  if (!isLoaded || !isSignedIn) {
    return (
      <View>
        <ActivityIndicator />
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
          title: "Map",
          headerTitleContainerStyle: {
            display: "none",
          },
          tabBarIcon: ({ color }) => <Entypo name="map" size={24} color={color} />,
          href: "/tabs/map",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => <MaterialIcons name="leaderboard" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: user?.username ?? "",
          tabBarIcon: ({ color }) => <MaterialIcons name="account-box" size={24} color={color} />
        }}
      />
      <Tabs.Screen redirect name="index" />
    </Tabs>
  );
}
