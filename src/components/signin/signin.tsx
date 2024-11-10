import { useSignIn } from "@clerk/clerk-expo";
import OauthSignIn from "@components/social-authentication/oauth-sign-in";
import Button from "@ui/button";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import type { FormData } from "./types";

const SignIn: React.FC = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSignInPress = async (data: FormData) => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: data.username,
        password: data.password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
      router.replace("/tabs");
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
    }
  };

  // TODO: validate username and password and show it on frontend
  return (
    <>
      <View className="w-2/3">
        <Text className="mb-4 text-xl font-semibold">Zaloguj się</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="login"
              className="px-3 py-2.5 border border-solid rounded-lg border-slate-300 mb-2"
            />
          )}
          name="username"
        />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="hasło"
              secureTextEntry
              className="px-3 py-2.5 border border-solid rounded-lg border-slate-300 mb-4"
            />
          )}
          name="password"
        />
        <Button
          title="Zaloguj się"
          onPress={handleSubmit(onSignInPress)}
          buttonClassName="px-3 py-2.5 rounded-lg bg-slate-500"
          textClassName="text-center"
        />
        <View className="flex flex-row my-2">
          <Text className="flex-1 h-px my-2 bg-slate-300" />
          <Text className="px-1 text-slate-400">lub</Text>
          <View className="flex-1 h-px my-2 bg-slate-300" />
        </View>
        <OauthSignIn />
        <Link
          href="/(auth)/sign-up"
          className="px-3 py-2.5 mt-4 text-white rounded-lg bg-slate-500 text-center"
        >
          Zarejestruj się
        </Link>
      </View>
    </>
  );
};

export default SignIn;
