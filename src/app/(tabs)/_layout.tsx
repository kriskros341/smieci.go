import { useUser } from "@clerk/clerk-expo";
import { Tabs } from "expo-router";
import React from "react";

function Layout() {
  const { user } = useUser();
  return (
    <Tabs>
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerTitleContainerStyle: {
            display: "none",
          },
          href: "map",
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
    </Tabs>
  );
}

export default Layout;
