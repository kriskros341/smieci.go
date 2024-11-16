import { useAuth, useUser } from "@clerk/clerk-expo";
import { Button, Text, View } from "react-native";

import { _getUserById } from "@api/users";
import { useAxios } from "@hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import DividerWithText from "@ui/DividerWithText";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const maxSupportPointsCount = 500

function timeUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  
  // Set the time to midnight of the next day
  midnight.setHours(24, 0, 0, 0);

  // Calculate the difference in milliseconds
  const timeDifference = midnight.getTime() - now.getTime();

  // Convert milliseconds to seconds
  const totalSeconds = timeDifference / 1000;


  // Format the result as "HH:MM:SS"
  return totalSeconds
}


const Account = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const insets = useSafeAreaInsets();
  const axios = useAxios();

  const { data: userData } = useQuery({
    queryFn: () => _getUserById(axios, user?.id),
    queryKey: [user?.id],
    enabled: !!user?.id,
  });

  const [secondsUntilMidnight, setSecondsUnitlMidnight] = useState(timeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsUnitlMidnight((current) => current - 1)
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  })

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(secondsUntilMidnight / 3600);
  const minutes = Math.floor((secondsUntilMidnight % 3600) / 60);
  const seconds = Math.floor(secondsUntilMidnight % 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return (
    <View className="flex-1 bg-#fff items-center p-8 gap-8">
      <View>
        <View className="flex items-center justify-center w-64 h-64 overflow-hidden border rounded-full">
          <Image className="w-full h-full" source={{ uri: user?.imageUrl }} />
        </View>
      </View>
      <View className="w-full gap-y-4">
        <DividerWithText>
          <Text>
            Dane ogólne
          </Text>
        </DividerWithText>
        <View className="flex-row">
          <Text>
            Dostępne punkty: {userData?.supportPoints} z maksymalnych {maxSupportPointsCount}
          </Text>
          <Tooltip delayDuration={150} className="ml-2">
            <TooltipTrigger>
              <AntDesign name="questioncircleo" size={20} color="black" />
            </TooltipTrigger>
            <TooltipContent insets={contentInsets} className="bg-white">
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <AntDesign name="doubleright" size={20} color="black" />
                  <Text>Pula dostępnych punktów zwiększa się codziennie o północy.</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <AntDesign name="doubleright" size={20} color="black" />
                  <View>
                    <Text>Czas do następnego zwiększenia:</Text>
                    <Text>{timeString}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <AntDesign name="warning" size={20} color="red" />
                  <Text>Nadmiarowe punkty są automatycznie rozdzielane pomiędzy pobliskie zgłoszenia</Text>
                </View>
              </View>
            </TooltipContent>
          </Tooltip> 
        </View>
        <Text>Zebrane punkty: {userData?.points}</Text>
        <Button
          title="Log out"
          onPress={() => {
            signOut();
            router.replace("/");
          }}
        />
      </View>
    </View>
  );
};

export default Account;
