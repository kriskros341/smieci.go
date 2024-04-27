import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Button, View , Text, TextInput, TouchableOpacity} from 'react-native';


import { useSignUp } from "@clerk/clerk-expo";
import { useState } from 'react';
import { Auth } from './interfaces';

interface SignUpScreenProps {
  auth: Auth
  switchToSignIn: () => void,
}

export default function SignUpScreen(props: SignUpScreenProps) {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // start the sign up process.
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      if (props.auth.password !== passwordRepeat) {
        throw "password repeat"
      }

      await signUp.create({
        username: props.auth.username,
        emailAddress: props.auth.emailAddress,
        password: props.auth.password,
      });

      // send the email.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // change the UI to our pending section.
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex justify-center border">
      {!pendingVerification && (
        <View className="p-4 gap-8">
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
              value={props.auth.emailAddress}
              placeholder="Email..."
              onChangeText={(email) => props.auth.onChange('emailAddress', email)}
            />
          </View>

          <View>
            <TextInput
              value={props.auth.password}
              placeholder="Password..."
              placeholderTextColor="#000"
              secureTextEntry={true}
              onChangeText={(password) => props.auth.onChange('password', password)}
            />
          </View>

          <View>
            <TextInput
              value={passwordRepeat}
              placeholder="Repeat Password..."
              placeholderTextColor="#000"
              secureTextEntry={true}
              onChangeText={(password) => setPasswordRepeat(password)}
            />
          </View>

          <View className="flex items-center">
            <TouchableOpacity className="mb-4" onPress={onSignUpPress}>
              <Text>Sign up</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={props.switchToSignIn}>
              <Text>Sign in instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {pendingVerification && (
        <View className="p-4 gap-8">
          <View>
            <TextInput
              value={code}
              placeholder="Code..."
              onChangeText={(code) => setCode(code)}
            />
          </View>
          <TouchableOpacity className="flex items-center" onPress={onPressVerify}>
            <Text>Verify Email</Text>
          </TouchableOpacity>
        </View>
      )}
      
    </View>
  );
}
