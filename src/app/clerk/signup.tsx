import { useSignUp } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { _createUser } from "../../api/users";
import { useAxios } from "../../hooks/use-axios";
import { Auth } from "../../interfaces";

interface SignUpScreenProps {
  auth: Auth;
  switchToSignIn: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({
  auth,
  switchToSignIn,
}) => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [passwordRepeat, setPasswordRepeat] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const axios = useAxios();

  const { mutateAsync: createUser } = useMutation({
    mutationFn: ({ email, username }: { email: string; username: string }) =>
      _createUser(axios, { email, username }),
    onSuccess: () => {
      console.log("successfuly created user");
    },
    onError: (err) => {
      console.log(`failed to create user ${err.message}`);
    },
  });

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        username: auth.username,
        emailAddress: auth.emailAddress,
        password: auth.password,
      });

      // send the email.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // change the UI to our pending section.
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await createUser({ email: auth.emailAddress, username: auth.username });

      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex justify-center border">
      {!pendingVerification && (
        <View className="gap-8 p-4">
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
              value={auth.emailAddress}
              placeholder="Email..."
              onChangeText={(email) => auth.onChange("emailAddress", email)}
            />
          </View>
          <View>
            <TextInput
              value={auth.password}
              placeholder="Password..."
              placeholderTextColor="#000"
              secureTextEntry={true}
              onChangeText={(password) => auth.onChange("password", password)}
            />
          </View>
          <View>
            <TextInput
              value={passwordRepeat}
              placeholder="Repeat Password..."
              placeholderTextColor="#000"
              secureTextEntry={true}
              onChangeText={(password) => {
                setPasswordRepeat(password);
                if (password !== auth.password) {
                  setPasswordError("Passwords don't match!");
                }
              }}
            />
          </View>
          <View className="flex items-center">
            <TouchableOpacity className="mb-4" onPress={onSignUpPress}>
              <Button title="Sign up" disabled={!!passwordError} />
            </TouchableOpacity>
            <TouchableOpacity onPress={switchToSignIn}>
              <Text>Sign in instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {pendingVerification && (
        <View className="gap-8 p-4">
          <View>
            <TextInput
              value={code}
              placeholder="Code..."
              onChangeText={(code) => setCode(code)}
            />
          </View>
          <TouchableOpacity className="flex items-center">
            <Button
              title="Verify Email"
              disabled={isLoading}
              onPress={onPressVerify}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SignUpScreen;
