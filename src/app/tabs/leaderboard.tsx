import { leaderboardTypes } from "@/interfaces";
import LeaderboardView from "@components/leaderboard/leaderboard-view";
import * as React from "react";
import { useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

const Leaderboard: React.FC = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const routes = [
    { key: "weekly", title: "Tygodniowe" },
    { key: "monthly", title: "Miesięczne" }, // TODO: change to all-time??
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

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      style={{ backgroundColor: "white" }}
      className="border-t border-solid border-slate-200"
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{ backgroundColor: "white" }}
          activeColor="black"
          inactiveColor="gray"
        />
      )}
    />
  );
};

export default Leaderboard;
