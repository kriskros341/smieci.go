import { LeaderboardEntry } from "@/interfaces";
import * as React from "react";
import { Text, View } from "react-native";

interface Props {
  entry: LeaderboardEntry;
  index: number;
}

const LeaderboardEntryView: React.FC<Props> = ({ entry, index }) => {
  return (
    <View className="flex flex-row items-center justify-around mt-2">
      <Text className="basis-1/5">{index + 1}</Text>
      <Text className="basis-3/5">{entry.username}</Text>
      <Text className="basis-1/5">{entry.numberOfPoints.toFixed(2)}</Text>
    </View>
  );
};

export default LeaderboardEntryView;
