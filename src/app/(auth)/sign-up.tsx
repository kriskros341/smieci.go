import { SignUp } from "@components/signup";
import * as React from "react";
import { View } from "react-native";

const SignUpScreen: React.FC = () => {
  return (
    <View className="flex items-center justify-center w-screen h-screen bg-white">
      <SignUp />
    </View>
  );
};

export default SignUpScreen;
