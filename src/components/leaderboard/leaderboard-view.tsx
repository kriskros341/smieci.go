import { LeaderboardEntry, LeaderboardType } from "@/interfaces";
import { _getLeaderboard } from "@api/leaderboard";
import { useUser } from "@clerk/clerk-expo";
import { useAxios } from "@hooks/use-axios";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import LeaderboardEntryView from "./leaderboard-entry-view";

interface Props {
  leaderboardType: LeaderboardType;
}

const reorderLeaderboard = (
  leaderboard: LeaderboardEntry[],
  currentUserId: string,
): (LeaderboardEntry & { rank: number })[] => {
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const currentUserEntry = rankedLeaderboard.find(
    (entry) => entry.userId === currentUserId,
  );
  const otherEntries = rankedLeaderboard.filter(
    (entry) => entry.userId !== currentUserId,
  );

  return currentUserEntry ? [currentUserEntry, ...otherEntries] : otherEntries;
};

const LeaderboardView: React.FC<Props> = ({ leaderboardType }) => {
  const axios = useAxios();
  const { user } = useUser();
  const { isPending, error, data } = useQuery({
    queryKey: ["leaderboard", leaderboardType],
    queryFn: () => _getLeaderboard(axios, leaderboardType),
  });

  if (isPending) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator size="large" color="#10a37f" />
        <Text className="mt-4 text-slate-600">Wczytywanie rankingu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 p-4">
        <Text className="mb-2 text-lg font-medium text-red-500">
          Ups! Coś poszło nie tak
        </Text>
        <Text className="text-center text-slate-600">{error.message}</Text>
      </View>
    );
  }

  if (!data?.length) {
    return (
      <View className="items-center justify-center flex-1 p-4">
        <Text className="mb-2 text-lg font-medium text-slate-700">
          Brak wyników
        </Text>
        <Text className="text-center text-slate-600">
          Nikt jeszcze nie zdobył punktów w tym okresie
        </Text>
      </View>
    );
  }

  const columnHeaders = [
    { label: "Pozycja", className: "w-20" },
    { label: "Użytkownik", className: "flex-1" },
    { label: "Punkty", className: "w-20 text-right" },
  ];

  const reorderedLeaderboard = reorderLeaderboard(data, user?.id!);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex flex-row justify-around p-4 bg-white shadow-sm">
        {columnHeaders.map(({ label, className }) => (
          <Text
            key={label}
            className={`${className} text-slate-500 font-medium`}
          >
            {label}
          </Text>
        ))}
      </View>
      <FlashList
        data={reorderedLeaderboard}
        renderItem={({ item, index }) => (
          <LeaderboardEntryView
            entry={item}
            isCurrentUser={item.userId === user?.id}
            isFirstInList={index === 0}
          />
        )}
        estimatedItemSize={200}
        ItemSeparatorComponent={() => (
          <View className="h-px mx-4 bg-slate-100" />
        )}
        className="px-2"
      />
    </View>
  );
};

export default LeaderboardView;
