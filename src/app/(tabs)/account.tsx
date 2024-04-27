import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { cn } from "../cn";
import { Link } from "expo-router";

const App = () => {
  return (
    <View className="flex-1 bg-#fff items-center p-8 gap-8">
      <View>
        <View className="border w-64 h-64 rounded-full flex justify-center items-center">
          <Text>User Picture</Text>
          <View className="absolute bottom-0 right-0 w-24 h-24 border rounded-full flex justify-center items-center">
            <Text>rank</Text>
          </View>
        </View>
      </View>
      <View className="w-full gap-y-8">
        <Text>username</Text>
        <Text>emailAddress</Text>
      </View>
    </View>
  )
}

export default App;