import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { getLeaderboard } from "../api/leaderboard";
import { cn } from "../cn";
import { Link } from "expo-router";
import { useQuery } from '@tanstack/react-query'
import { FlashList } from "@shopify/flash-list";

const LeaderboardEntry = (props: any) => {
  return (
    <View>
      <View className="border">
        <Image className="h-4 w-4" source={{ uri: props.avatar }} />
      </View>
      <View>
        <Text>{props.username}</Text>
      </View>
      <View>
        <Text>{props.points}</Text>
      </View>
    </View>
  )
}

const App = () => {
  
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  })

  console.log({ isPending, error })

  let leaderboard = <View><Text>loading</Text></View>;
  if (!isPending && !error) {
    leaderboard = (
      <View className="border w-full h-full">
        <FlashList
          data={data}
          renderItem={({ item, index }) => <LeaderboardEntry key={index} {...item} />}
          estimatedItemSize={200}
        />
      </View>
    )
  } 

  return (
    <View className="flex-1 bg-#fff items-center justify-center gap-4">
      <TouchableOpacity onPress={() => refetch()}>
        <Text>refetch</Text>
      </TouchableOpacity>
      {leaderboard}
    </View>
  )
}

export default App;