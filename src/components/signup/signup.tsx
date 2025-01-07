import { useSignUp } from "@clerk/clerk-expo";
import OauthSignUp from "@components/social-authentication/oauth-sign-up";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Button from "@ui/button";
import { Link, router } from "expo-router";
import * as React from "react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { schema } from "./schema";
import type { FormData } from "./types";

const SignUp: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const codeVerificationCallback = useRef<(code: string) => void>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      emailAddress: "",
      password: "",
      confirmPassword: "",
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
      };
    });
  };

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async ({
      emailAddress,
      username,
      password,
    }: {
      emailAddress: string;
      username: string;
      password: string;
    }) => {
      if (!isLoaded) {
        throw new Error("Clerk failed to load");
      }
      await signUp.create({
        username,
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      const session = await handleCodeVerification();
      await setActive({ session });
    },

    // TODO: convert to toast
    onSuccess: () => {
      console.log("successfuly created user");
    },
    onError: (error) => {
      console.warn(`error occured ${error}`);
    },
  });

  const onSignUpPress = async ({
    username,
    emailAddress,
    password,
  }: FormData) => {
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
      router.replace("/tabs");
    } catch (error) {
      console.warn(`error occured ${error}`);
    }
  };

  const goBack = () => {
    setCode("");
    setPendingVerification(false);
  };

  if (!pendingVerification) {
    return (
      <View className="w-2/3">
        <Text className="mb-2 text-xl font-semibold">Stwórz konto</Text>
        <View className="flex my-2">
          <Text className="mb-2 text-xs text-slate-400">Email</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                autoCapitalize="none"
                className="px-3 py-2.5 border border-solid rounded-lg border-slate-300"
              />
            )}
            name="emailAddress"
          />
          {errors.emailAddress && (
            <Text className="mt-2 text-xs text-red-500">
              {errors.emailAddress.message}
            </Text>
          )}
        </View>
        <View className="flex my-2">
          <Text className="mb-2 text-xs text-slate-400">Login</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                autoCapitalize="none"
                className="px-3 py-2.5 border border-solid rounded-lg border-slate-300"
              />
            )}
            name="username"
          />
          {errors.username && (
            <Text className="mt-2 text-xs text-red-500">
              {errors.username.message}
            </Text>
          )}
        </View>
        <View className="flex my-2">
          <Text className="mb-2 text-xs text-slate-400">Hasło</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholderTextColor="#000"
                secureTextEntry={true}
                className="px-3 py-2.5 border border-solid rounded-lg border-slate-300"
              />
            )}
            name="password"
          />
          {errors.password && (
            <Text className="mt-2 text-xs text-red-500">
              {errors.password.message}
            </Text>
          )}
        </View>
        <View className="flex my-2">
          <Text className="mb-2 text-xs text-slate-400">Potwierdź hasło</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholderTextColor="#000"
                secureTextEntry
                className="px-3 py-2.5 border border-solid rounded-lg border-slate-300"
              />
            )}
            name="confirmPassword"
          />
          {errors.confirmPassword && (
            <Text className="mt-2 text-xs text-red-500">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>
        <View className="my-2">
          <Button
            title="Zarejestruj się"
            onPress={handleSubmit(onSignUpPress)}
            buttonClassName="px-3 py-2.5 rounded-lg bg-green"
          />
        </View>
        <View className="flex flex-row items-center justify-center">
          <Text className="mr-1 text-slate-400">Masz już konto?</Text>
          <Link href="/(auth)/sign-in" className="text-green">
            Zaloguj się
          </Link>
        </View>
        <View className="flex flex-row my-2">
          <Text className="flex-1 h-px my-2 bg-slate-300" />
          <Text className="px-1 text-slate-400">lub</Text>
          <View className="flex-1 h-px my-2 bg-slate-300" />
        </View>
        <OauthSignUp />
      </View>
    );
  }

  return (
    <View className="w-2/3">
      <Text className="mb-2 text-xl font-semibold">Weryfikacja email</Text>
      <Text className="mb-4 text-sm text-slate-600">
        Wprowadź kod weryfikacyjny, który został wysłany na Twój adres email
      </Text>

      <View className="flex my-2">
        <Text className="mb-2 text-xs text-slate-400">Kod weryfikacyjny</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          keyboardType="number-pad"
          className="px-3 py-2.5 border border-solid rounded-lg border-slate-300"
          placeholder="Wprowadź kod..."
        />
      </View>

      <View className="my-2">
        <Button
          title="Zweryfikuj email"
          onPress={verifyCode}
          buttonClassName="px-3 py-2.5 rounded-lg bg-green"
        />
      </View>

      <View className="mt-1">
        <Button
          title="Wróć"
          onPress={goBack}
          buttonClassName="px-3 py-2.5 rounded-lg bg-slate-100"
          textClassName="text-slate-700"
        />
      </View>
    </View>
  );
};

export default SignUp;
