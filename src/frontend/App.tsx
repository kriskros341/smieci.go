import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import { NativeWindStyleSheet } from "nativewind";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { getAlbums } from "./api/get-albums";
import { cn } from "./cn";

NativeWindStyleSheet.setOutput({
  default: "native",
});

const App: React.FC = () => {
  return (
    <View className="flex-1 bg-[#101010] items-center justify-center gap-4">
      <Text className="text-white">Smieci.go</Text>
      <StatusBar style="auto" />
      <Pressable
        className={cn(
          "bg-[#244c26] hover:bg-[#50AA54] rounded-lg shadow-sm p-4 m-0",
        )}
        onPress={async () => {
          const albums = await getAlbums();
          console.log(albums);
        }}
      >
        <Text className="text-white">Kliknij mnie</Text>
      </Pressable>
    </View>
  );
};

export default registerRootComponent(App);
