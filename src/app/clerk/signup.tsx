import * as React from "react";
import { View } from "react-native";
import { SignUp } from "../../components/signup";

interface SignUpScreenProps {
  switchToSignIn: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ switchToSignIn }) => {
  return (
    <View className="flex justify-center border">
      <SignUp switchToSignIn={switchToSignIn} />
    </View>
  );
};

export default SignUpScreen;
