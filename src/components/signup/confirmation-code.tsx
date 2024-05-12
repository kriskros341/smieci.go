import { useSignUp } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { Button, TextInput, View } from "react-native";
import { _createUser } from "../../api/users";
import { useAxios } from "../../hooks/use-axios";

interface Props {
  email: string;
  username: string;
  goBack: () => void;
}

const ConfirmationCode: React.FC<Props> = ({ email, username, goBack }) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = React.useState(false);
  const [code, setCode] = React.useState("");

  const axios = useAxios();

  const { mutateAsync: createUser } = useMutation({
    mutationFn: ({ email, username }: { email: string; username: string }) => {
      console.log({ email, username })
      return _createUser(axios, { email, username });
    },

    // TODO: convert to toast
    onSuccess: () => {
      console.log("successfuly created user");
    },
    onError: (err) => {
      console.log(`failed to create user ${err.message}`);
    },
  });

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });

      await createUser({ email, username });
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        disabled={isLoading}
        onPress={onPressVerify}
      />
      <Button
        title="back"
        onPress={goBack}
      />
    </View>
  );
};

export default ConfirmationCode;
