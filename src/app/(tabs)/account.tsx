import { useAuth, useUser } from "@clerk/clerk-expo";
import { Button, Text, View } from "react-native";

import { _getUserByClerkId } from "@api/users";
import { useAxios } from "@hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";

const Account = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const axios = useAxios();

  const { data: userData } = useQuery({
    queryFn: () => _getUserByClerkId(axios, user?.id),
    queryKey: [user?.id],
    enabled: !!user?.id,
  });

  console.log({ id: user?.id });
  console.log({ useruri: user?.imageUrl });

  return (
    <View className="flex-1 bg-#fff items-center p-8 gap-8">
      <View>
        <View className="flex items-center justify-center w-64 h-64 border rounded-full overflow-hidden">
          <Image className="w-full h-full" source={{ uri: user?.imageUrl }} />
        </View>
      </View>
      <View className="w-full gap-y-8">
        <Text>{user?.username ?? "Unknown"}</Text>
        <Text>{user?.emailAddresses[0]?.emailAddress ?? "Unknown"}</Text>
        <Text>Points: {userData?.points}</Text>
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
