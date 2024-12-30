import { LeaderboardType } from "@/interfaces";
import { _getLeaderboard } from "@api/leaderboard";
import { useAxios } from "@hooks/use-axios";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import Button from "@ui/button";
import * as React from "react";
import { Text, View } from "react-native";
import LeaderboardEntryView from "./leaderboard-entry-view";

interface Props {
  leaderboardType: LeaderboardType;
}

const LeaderboardView: React.FC<Props> = ({ leaderboardType }) => {
  const axios = useAxios();

  const { isPending, error, data } = useQuery({
    queryKey: ["leaderboard", leaderboardType],
    queryFn: () => _getLeaderboard(axios, leaderboardType),
  });

  if (isPending) {
    return <Text>loading</Text>;
  }

  if (error) {
    return <Text>error: {error.message}</Text>;
  }

  // TODO: empty state
  return (
    <View className="h-full p-4">
      <View className="flex flex-row justify-around">
        <Text className="basis-1/5 text-slate-400">Pozycja</Text>
        <Text className="basis-3/5 text-slate-400">Użytkownik</Text>
        <Text className="basis-1/5 text-slate-400">Punkty</Text>
      </View>
      <FlashList
        data={data}
        renderItem={({ item, index }) => (
          <LeaderboardEntryView key={item.userId} entry={item} index={index} />
        )}
        estimatedItemSize={200}
      />
    </View>
  );
};

export default LeaderboardView;
