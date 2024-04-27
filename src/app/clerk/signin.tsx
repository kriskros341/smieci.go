import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Auth } from "./interfaces";


interface SignInScreenProps {
  auth: Auth,
  switchToSignUp: () => void
}

export default function SignInScreen(props: SignInScreenProps) {
  const { signIn, setActive, isLoaded } = useSignIn();

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: props.auth.username,
        password: props.auth.password,
      });
      // This is an important step,
      // This indicates the user is signed in
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
    }
  };
  return (
    <View className="flex justify-center border p-4 gap-8">
      <View>
        <TextInput
          autoCapitalize="none"
          value={props.auth.username}
          placeholder="User Name..."
          onChangeText={(username) => props.auth.onChange('username', username)}
        />
      </View>

      <View>
        <TextInput
          autoCapitalize="none"
          value={props.auth.password}
          placeholder="Password..."
          secureTextEntry={true}
          onChangeText={(password) => props.auth.onChange('password', password)}
        />
      </View>

      <View className="flex items-center gap-y-4">
        <TouchableOpacity onPress={onSignInPress}>
          <Text>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.switchToSignUp}>
          <Text>Sign up instead</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}