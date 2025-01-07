import { LeaderboardEntry } from "@/interfaces";
import { cn } from "@utils/cn";
import { useState } from "react";
import { Image, Text, View } from "react-native";

interface Props {
  entry: LeaderboardEntry & { rank: number };
  isCurrentUser: boolean;
  isFirstInList: boolean;
}

const LeaderboardEntryView: React.FC<Props> = ({
  entry,
  isCurrentUser,
  isFirstInList,
}) => {
  const [imageError, setImageError] = useState(false);
  const isTopThree = entry.rank <= 3;
  const positionColors = [
    "text-yellow-600", // Gold
    "text-gray-400", // Silver
    "text-amber-700", // Bronze
  ];

  return (
    <View
      className={cn(
        "flex flex-row items-center p-4",
        isCurrentUser ? "bg-blue-50" : "bg-white",
        isFirstInList && !isCurrentUser && entry.rank === 1
          ? "bg-yellow-50"
          : "",
      )}
    >
      <Text
        className={cn(
          "w-20 font-semibold",
          isTopThree ? positionColors[entry.rank - 1] : "text-slate-600",
        )}
      >
        #{entry.rank}
      </Text>
      <View className="flex flex-row items-center flex-1">
        <View className="w-10 h-10 mr-3 overflow-hidden rounded-full bg-slate-200">
          {entry.imageUrl ? (
            <Image
              source={{ uri: entry.imageUrl }}
              className="w-full h-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="items-center justify-center w-full h-full bg-blue-100">
              <Text className="font-semibold text-blue-700">
                {entry.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center flex-1">
          <Text className="font-medium text-slate-700">{entry.username}</Text>
          {isCurrentUser && (
            <View className="ml-2 px-2 py-0.5 bg-blue-100 rounded">
              <Text className="text-xs font-medium text-blue-700">TY</Text>
            </View>
          )}
        </View>
      </View>
      <Text className="w-20 font-semibold text-right text-blue-700">
        {entry.numberOfPoints.toFixed(2)}
      </Text>
    </View>
  );
};

export default LeaderboardEntryView;
