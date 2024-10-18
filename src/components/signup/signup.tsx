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

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async ({ emailAddress, username, password }: { emailAddress: string; username: string, password: string }) => {
      if (!isLoaded) {
        throw new Error("Clerk failed to load");
      }
      await signUp.create({
        username,
        emailAddress,
        password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      const session = await handleCodeVerification();
      await setActive({ session });
    },

    // TODO: convert to toast
    onSuccess: () => {
      console.log("successfuly created user");
    },
    onError: (error) => {
      console.warn(`error occured ${error}`)
    },
  });

  const onSignUpPress = async ({ username, emailAddress, password }: FormData) => {
    if (!isLoaded) {
      return;
    }
    createUser({ username, emailAddress, password });
  };

  const verifyCode = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (!completeSignUp.createdSessionId) {
        return;
      }
      codeVerificationCallback.current?.(completeSignUp.createdSessionId);
    } catch (error) {
      console.warn(`error occured ${error}`)
    }
  }

  const goBack = () => {
    setCode('');
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
      <View className="p-4 flex gap-y-4">
        <View className="border">
          <TextInput
            value={code}
            placeholder="Code..."
            onChangeText={(code) => setCode(code)}
          />
        </View>
        <View>
          <Button
            title="Verify Email"
            onPress={verifyCode}
          />
        </View>
        <View>
          <Button
            title="back"
            onPress={goBack}
          />
        </View>
      </View>
    </>
  );
};

export default SignUp;
