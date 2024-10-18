import { useSignUp } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

import Button from "@ui/button";
import { schema } from "./schema";
import type { FormData } from "./types";
import { useMutation } from "@tanstack/react-query";

interface Props {
  switchToSignIn: () => void;
}

const SignUp: React.FC<Props> = ({ switchToSignIn }) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const codeVerificationCallback = useRef<(code: string) => void>();
  
  const handleCodeVerification = () => {
    if (!isLoaded) {
      return;
    }  
    setPendingVerification(true);
    return new Promise<string>((resolve) => {
      codeVerificationCallback.current = (code: string) => {
        resolve(code);
      }
    })
  }
  
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: "test",
      emailAddress: "test+clerk_test@ll.ll",
      password: "testtest",
      confirmPassword: "testtest",
    },
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async ({ emailAddress, username, password }: { emailAddress: string; username: string, password: string }) => {
      if (!isLoaded) {
        console.warn("Clerk failed to load")
        throw new Error("Clerk failed to load");
      }
      console.log("test!")
      await signUp.create({
        username,
        emailAddress,
        password,
      })
      console.log("test!")
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      console.log("test!")
      const code = await handleCodeVerification();
      console.log("test!")
      if (!code) {
        throw new Error("Code was undefined");
      }
      console.log("test!")
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("test!")
      await setActive({ session: completeSignUp.createdSessionId });
    },

    // TODO: convert to toast
    onSuccess: () => {
      console.log("successfuly created user");
    },
    onError: (err) => {
      console.warn(`failed to create user ${err}`);
    },
  });

  const onSignUpPress = async ({ username, emailAddress, password }: FormData) => {
    if (!isLoaded) {
      return;
    }
    createUser({ username, emailAddress, password })
  };

  const goBack = () => {
    setPendingVerification(false);
  }

  if (!pendingVerification) {
    return (
      <View>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              autoCapitalize="none"
              placeholder="Username..."
              className="px-4 py-2"
            />
          )}
          name="username"
        />
        {errors.username && (
          <Text className="text-xs text-red-500">
            {errors.username.message}
          </Text>
        )}
        <View className="w-full h-px bg-gray-300" />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              autoCapitalize="none"
              placeholder="Email..."
              className="px-4 py-2"
            />
          )}
          name="emailAddress"
        />
        {errors.emailAddress && (
          <Text className="text-xs text-red-500">
            {errors.emailAddress.message}
          </Text>
        )}
        <View className="w-full h-px bg-gray-300" />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Password..."
              placeholderTextColor="#000"
              secureTextEntry={true}
              className="px-4 py-2"
            />
          )}
          name="password"
        />
        {errors.password && (
          <Text className="text-xs text-red-500">
            {errors.password.message}
          </Text>
        )}
        <View className="w-full h-px bg-gray-300" />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Confirm password..."
              placeholderTextColor="#000"
              secureTextEntry
              className="px-4 py-2"
            />
          )}
          name="confirmPassword"
        />
        {errors.confirmPassword && (
          <Text className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </Text>
        )}
        <View className="w-full h-px bg-gray-300" />
        <View className="flex flex-row items-center justify-center my-4">
          <Button
            title="Sign up"
            onPress={handleSubmit(onSignUpPress)}
            className="mr-2 "
          />
          <Button title="Sign in instead" onPress={switchToSignIn} />
        </View>
      </View>
    )
  }

  return (
    <>
      <View className="gap-8 p-4">
        <View>
          <TextInput
            value={code}
            placeholder="Code..."
            onChangeText={(code) => setCode(code)}
          />
        </View>
        <Button
          title="Verify Email"
          onPress={() => codeVerificationCallback.current?.(code)}
        />
        <Button
          title="back"
          onPress={goBack}
        />
      </View>
    </>
  );
};

export default SignUp;
