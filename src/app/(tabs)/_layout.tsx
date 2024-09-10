import { Tabs } from "expo-router";
import React from "react";

function Layout() {
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
          title: "Account",
        }}
      />
    </Tabs>
  );
}

export default Layout;
