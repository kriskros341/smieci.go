import { useSignIn } from "@clerk/clerk-expo";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import Button from "../../ui/button";
import type { FormData } from "./types";

interface Props {
  switchToSignUp: () => void;
}

const SignIn: React.FC<Props> = ({ switchToSignUp }) => {
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
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
    }
  };

  // TODO: validate username and password and show it on frontend
  return (
    <View>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            placeholder="Username..."
            className="px-4 py-2"
          />
        )}
        name="username"
      />
      <View className="w-full h-px bg-gray-300" />
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            placeholder="Password..."
            secureTextEntry
            className="px-4 py-2"
          />
        )}
        name="password"
      />
      <View className="w-full h-px bg-gray-300" />
      <View className="flex flex-row items-start justify-center my-4">
        <Button
          title="Sign in"
          onPress={handleSubmit(onSignInPress)}
          buttonClassName="mr-2"
        />
        <Button title="Sign up instead" onPress={switchToSignUp} />
      </View>
    </View>
  );
};

export default SignIn;
