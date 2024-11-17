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
        <Text className="mb-2 text-xl font-semibold">Zaloguj się</Text>
        <View className="flex my-2">
          <Text className="mb-2 text-xs text-slate-400">Login</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                className="px-3 py-2.5 border border-solid rounded-lg border-slate-300"
              />
            )}
            name="username"
          />
        </View>
        <View className="flex my-2">
          <Text className="mb-2 text-xs text-slate-400">Hasło</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                secureTextEntry
                className="px-3 py-2.5 border border-solid rounded-lg border-slate-300 mb-4"
              />
            )}
            name="password"
          />
        </View>
        <Button
          title="Zaloguj się"
          onPress={handleSubmit(onSignInPress)}
          buttonClassName="px-3 py-2.5 rounded-lg bg-green mb-2"
          textClassName="text-center"
        />
        <View className="flex flex-row justify-center gap-1">
          <Text className="text-slate-400">Nowy tutaj?</Text>
          <Link className="text-green" href="/(auth)/sign-up">
            Rejestracja
          </Link>
        </View>
        <View className="flex flex-row my-2">
          <Text className="flex-1 h-px my-2 bg-slate-300" />
          <Text className="px-1 text-slate-400">lub</Text>
          <View className="flex-1 h-px my-2 bg-slate-300" />
        </View>
        <OauthSignIn />
      </View>
    </>
  );
};

export default SignIn;
