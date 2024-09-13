import React from "react";
import { View } from "react-native";

import Signin from "@components/signin";

interface SignInScreenProps {
  switchToSignUp: () => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ switchToSignUp }) => {
  return (
    <View className="grid mx-1 border place-content-center">
      <Signin switchToSignUp={switchToSignUp} />
    </View>
  );
};

export default SignInScreen;
