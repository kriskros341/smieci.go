import { Link } from "expo-router";
import * as React from "react";
import { Text, View } from "react-native";

const Index: React.FC = () => {
  return (
    <View className="flex items-center justify-center w-screen h-screen">
      <Text className="mb-2 text-4xl">Śmieci.go</Text>
      <Text className="mb-4 text-xl">Zbieraj śmieci i uzyskuj punkty!</Text>
      <View className="flex flex-row gap-x-6">
        <Link
          href="/(auth)/sign-in"
          className="py-2.5 px-3 rounded-lg bg-green text-white"
        >
          Logowanie
        </Link>
        <Link
          href="/(auth)/sign-up"
          className="py-2.5 px-3 rounded-lg bg-green text-white"
        >
          Rejestracja
        </Link>
      </View>
    </View>
  );
};

export default Index;
