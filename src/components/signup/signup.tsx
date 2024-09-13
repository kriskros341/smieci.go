import { useSignUp } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

import { _getUsers } from "@api/users";
import { useAxios } from "@hooks/use-axios";
import Button from "@ui/button";
import ConfirmationCode from "./confirmation-code";
import { schema } from "./schema";
import type { FormData } from "./types";

interface Props {
  switchToSignIn: () => void;
}

const SignUp: React.FC<Props> = ({ switchToSignIn }) => {
  const { isLoaded, signUp } = useSignUp();
  const [pendingVerification, setPendingVerification] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      emailAddress: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schema),
  });

  const onSignUpPress = async (formData: FormData) => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        username: formData.username,
        emailAddress: formData.emailAddress,
        password: formData.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
      // TODO: handle user exists and email exists errors on front
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const goBack = () => {
    setPendingVerification(false);
  }

  const axios = useAxios();
  const testApi = () => {
    _getUsers(axios).then(r => console.log({ r }))
  }

  return (
    <>
      {!pendingVerification ? (
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
              buttonClassName="mr-2 "
            />
            <Button title="Sign in instead" onPress={switchToSignIn} />
          </View>
        </View>
      ) : (
        <ConfirmationCode
          email={getValues("emailAddress")}
          username={getValues("username")}
          goBack={() => goBack()}
        />
      )}
      <Button title="test api" onPress={testApi} />
    </>
  );
};

export default SignUp;
