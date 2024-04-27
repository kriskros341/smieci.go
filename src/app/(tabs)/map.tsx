import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { cn } from "../cn";
import { Link } from "expo-router";
import MapView from 'react-native-maps';

const App = () => {
  return (
    <View className="flex-1">
      <MapView className="w-full h-full" />
    </View>
  )
}

export default App;