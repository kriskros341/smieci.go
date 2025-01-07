import { leaderboardTypes } from "@/interfaces";
import LeaderboardView from "@components/leaderboard/leaderboard-view";
import * as React from "react";
import { useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

interface Route {
  key: string;
  title: string;
}

const Leaderboard: React.FC = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const routes: Route[] = [
    { key: "weekly", title: "Tygodniowe" },
    { key: "monthly", title: "Miesięczne" },
    { key: "alltime", title: "Ogólne" },
  ];

  const renderScene = SceneMap({
    weekly: () => <LeaderboardView leaderboardType={leaderboardTypes.WEEKLY} />,
    monthly: () => (
      <LeaderboardView leaderboardType={leaderboardTypes.MONTHLY} />
    ),
    alltime: () => (
      <LeaderboardView leaderboardType={leaderboardTypes.ALL_TIME} />
    ),
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={{ backgroundColor: "white" }}
      activeColor="#1d4ed8"
      inactiveColor="#94a3b8"
      indicatorStyle={{ backgroundColor: "#1d4ed8" }}
      labelStyle={{ fontWeight: "600", textTransform: "none" }}
      className="shadow-sm"
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      style={{ backgroundColor: "white" }}
      className="border-t border-solid border-slate-100"
      renderTabBar={renderTabBar}
    />
  );
};

export default Leaderboard;
