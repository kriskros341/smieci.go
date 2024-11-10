import Signin from "@components/signin";
import React from "react";
import { View } from "react-native";

const SignInScreen: React.FC = () => {
  return (
    <View className="flex items-center justify-center w-screen h-screen bg-white">
      <Signin />
    </View>
  );
};

export default SignInScreen;
