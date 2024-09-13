import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

import { _getUsers } from "@api/users";
import LeaderboardEntry from "@components/leaderboard-entry";
import { useAxios } from "@hooks/use-axios";
import Button from "@ui/button";

const Leaderboard = () => {
  const axios = useAxios();

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => _getUsers(axios),
  });

  const getLeaderboard = () => {
    switch (true) {
      case isPending:
        return (
          <View>
            <Text>loading</Text>
          </View>
        );
      case !!error:
        return (
          <View>
            <Text>error: {error.message}</Text>
          </View>
        );
      default:
        return (
          <View className="w-full h-full p-4">
            <FlashList
              data={data.data}
              renderItem={({ item }) => (
                <LeaderboardEntry
                  key={item.username}
                  username={item.username}
                  points={Math.floor(Math.random() * 100)}
                />
              )}
              estimatedItemSize={200}
            />
          </View>
        );
    }
  };

  return (
    <View className="flex items-center bg-#fff">
      <Button title="refetch" onPress={() => refetch()} />
      {getLeaderboard()}
    </View>
  );
};

export default Leaderboard;
