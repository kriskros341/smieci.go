import { useUser } from "@clerk/clerk-expo";
import { Tabs } from "expo-router";

export default function Layout() {
  const { user } = useUser();

  return (
    <Tabs initialRouteName="map">
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerTitleContainerStyle: {
            display: "none",
          },
          href: "/tabs/map",
          header() {
            return null;
          },
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: user?.username ?? "",
        }}
      />
      <Tabs.Screen redirect name="index" />
    </Tabs>
  );
}
