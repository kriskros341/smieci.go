import { useAuth, useUser } from "@clerk/clerk-expo";
import { Button, Text, View } from "react-native";

import { _getUsers } from "@api/users";
import { useAxios } from "@hooks/use-axios";

const Account = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const axios = useAxios();

  const testApi = () => {
    _getUsers(axios).then(test => console.log({ test }))
  }

  return (
    <View className="flex-1 bg-#fff items-center p-8 gap-8">
      <View>
        <View className="flex items-center justify-center w-64 h-64 border rounded-full">
          <Text>User Picture</Text>
          <View className="absolute bottom-0 right-0 flex items-center justify-center w-24 h-24 border rounded-full">
            <Text>rank</Text>
          </View>
        </View>
      </View>
      <View className="w-full gap-y-8">
        <Button title="test api" onPress={() => testApi()}/>
        <Text>{user?.username ?? "Unknown"}</Text>
        <Text>{user?.emailAddresses[0]?.emailAddress ?? "Unknown"}</Text>
        <Button
          title="Log out"
          onPress={() => {
            signOut();
          }}
        />
      </View>
    </View>
  );
};

export default Account;
