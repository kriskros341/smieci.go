import * as React from "react";
import { Image, Text, View } from "react-native";
import { LeaderboardEntryDTO } from "@/interfaces";

const LeaderboardEntry: React.FC<LeaderboardEntryDTO> = ({
  points,
  username,
}) => {
  return (
    <View>
      <View className="border">
        <Image className="w-4 h-4" source={{ uri: undefined }} />
      </View>
      <View className="flex flex-row">
        <Text className="text-gray-600">Username: </Text>
        <Text>{username}</Text>
      </View>
      <View className="flex flex-row">
        <Text className="text-gray-600">Points: </Text>
        <Text>{points}</Text>
      </View>
    </View>
  );
};

export default LeaderboardEntry;
