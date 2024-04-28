import { useSignIn } from "@clerk/clerk-expo";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Auth } from "../../interfaces";

interface SignInScreenProps {
  auth: Auth;
  switchToSignUp: () => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({
  auth,
  switchToSignUp,
}) => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: auth.username,
        password: auth.password,
      });
      // This is an important step,
      // This indicates the user is signed in
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
    }
  };
  return (
    <View className="flex justify-center gap-8 p-4 border">
      <View>
        <TextInput
          autoCapitalize="none"
          value={auth.username}
          placeholder="User Name..."
          onChangeText={(username) => auth.onChange("username", username)}
        />
      </View>

      <View>
        <TextInput
          autoCapitalize="none"
          value={auth.password}
          placeholder="Password..."
          secureTextEntry={true}
          onChangeText={(password) => auth.onChange("password", password)}
        />
      </View>

      <View className="flex items-center gap-y-4">
        <TouchableOpacity onPress={onSignInPress}>
          <Text>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={switchToSignUp}>
          <Text>Sign up instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignInScreen;
