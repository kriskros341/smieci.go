import { useSignUp } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
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
  const [pendingVerification, setPendingVerification] = React.useState(false);

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
      code: "",
    },
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async ({ emailAddress, username, password }: { emailAddress: string; username: string, password: string }) => {
      if (!isLoaded) {
        return;
      }  
      return signUp.create({
        username,
        emailAddress,
        password,
      });//_createUser(axios, { email, username }); /// REPLACE
    },

    // TODO: convert to toast
    onSuccess: () => {
      console.log("successfuly created user");
    },
    onError: (err) => {
      console.log(`failed to create user ${err.message}`);
    },
  });

  const onPressVerify = async (formData: FormData) => {
    if (!isLoaded) {
      return;
    }

    const { code, emailAddress, username, password } = formData;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });

      await createUser({ emailAddress, username, password });
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    
    setPendingVerification(true);
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
            onPress={onSignUpPress}
            className="mr-2 "
          />
          <Button title="Sign in instead" onPress={switchToSignIn} />
        </View>
      </View>
    )
  }

  return (
    <>
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="gap-8 p-4">
            <View>
              <TextInput
                value={value}
                placeholder="Code..."
                onChangeText={(code) => onChange(code)}
              />
            </View>
            <Button
              title="Verify Email"
              onPress={handleSubmit(onPressVerify)}
            />
            <Button
              title="back"
              onPress={goBack}
            />
          </View>
        )}
        name="code"
      />
      <View className="flex flex-row items-center justify-center my-4">
        <Button
          title="Sign up"
          onPress={handleSubmit(onSignUpPress)}
          className="mr-2 "
        />
        <Button title="Sign in instead" onPress={switchToSignIn} />
      </View>
    </>
  );
};

export default SignUp;
