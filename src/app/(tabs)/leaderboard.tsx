import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Text, TouchableOpacity, View } from "react-native";
import { getLeaderboard } from "../../api/leaderboard";
import LeaderboardEntry from "../../components/leaderboard-entry";

const Leaderboard = () => {
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  console.log({ isPending, error });

  let leaderboard = (
    <View>
      <Text>loading</Text>
    </View>
  );
  if (!isPending && !error) {
    leaderboard = (
      <View className="w-full h-full border">
        <FlashList
          data={data}
          renderItem={({ item }) => (
            <LeaderboardEntry key={item.username} {...item} />
          )}
          estimatedItemSize={200}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-#fff items-center justify-center gap-4">
      <TouchableOpacity onPress={() => refetch()}>
        <Text>refetch</Text>
      </TouchableOpacity>
      {leaderboard}
    </View>
  );
};

export default Leaderboard;
