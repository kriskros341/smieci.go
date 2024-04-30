import { Tabs } from "expo-router";
import React from "react";

function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerTitleContainerStyle: {
            display: "none",
          },
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
          title: "Account",
        }}
      />
    </Tabs>
  );
}

export default TabLayout;
