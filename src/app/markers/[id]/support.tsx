import { _supportMarker } from "@api/markers";
import { _getUserById } from "@api/users";
import { useUser } from "@clerk/clerk-expo";
import { useAxios } from "@hooks/use-axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@ui/button";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

const Support = () => {
  const [delta, setDelta] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [finalDelta, setFinalDelta] = useState(0);
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const axios = useAxios();

  const { data: userData } = useQuery({
    queryFn: () => _getUserById(axios, user?.id),
    queryKey: [user?.id],
    enabled: !!user?.id,
  });

  const { data: markerData } = useQuery<any>({
    queryKey: [`/markers/${id}`],
  });

  const updateFinalDelta = () => {
    setDelta(0);
    setFinalDelta(finalDelta + delta * multiplier);
  };

  const useSupportMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.id || !markerData?.id) {
        throw new Error("Wystąpił błąd");
      }

      return _supportMarker(axios, {
        userId: user.id,
        markerId: markerData.id,
        amount,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [`/markers/${id}/supporters`],
      });
      router.back()
    }
  });

  const submit = async () => {
    useSupportMutation.mutate(finalDelta)
  }
  const isCommitDisabled = markerData?.points + finalDelta < 0;
  return (
    <View className="space-y-4 p-4 w-full">
        {/* Points Display */}
        <View className="bg-gray-50 p-3 rounded-lg">
          <Text className="text-lg font-medium">
            Dostępne punkty: {userData?.supportPoints}
          </Text>
        </View>
  
        {/* Multiplier Selection */}
        <View>
          <Text className="text-sm text-gray-600 mb-2">Wybierz mnożnik</Text>
          <View className="flex flex-row gap-2">
            {[1, 10, 100].map((value) => (
              <View key={value} className="flex-1 ">
                <Button
                  title={value.toString()}
                  onPress={() => setMultiplier(value)}
                  buttonClassName={`${
                    multiplier === value ? 'bg-blue-600' : 'bg-gray-200'
                  } py-2 rounded-lg`}
                  textClassName={multiplier === value ? "" : "text-blue-600"}
                />
              </View>
            ))}
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            Aktywny mnożnik: x{multiplier}
          </Text>
        </View>
  
        {/* Delta Controls */}
        <View>
          <Text className="text-sm text-gray-600 mb-2">Dostosuj wartość</Text>
          <View className="flex flex-row gap-2">
            <View className="flex-1">
              <Button 
                title="-"
                onPress={() => setDelta(delta - 1)}
                buttonClassName="bg-blue-600 py-2 rounded-lg"
              />
            </View>
            <View className="flex-1">
              <Button
                title="+"
                onPress={() => setDelta(delta + 1)}
                buttonClassName="bg-blue-600 py-2 rounded-lg"
              />
            </View>
          </View>
          <Text className="text-center text-sm">
            Punkty zgłoszenia: {markerData?.points + finalDelta} + {delta * multiplier}
          </Text>
        </View>
  
        {/* Actions */}
        <View className="space-y-2">
          <Button
            title="Aplikuj"
            onPress={updateFinalDelta}
            buttonClassName="bg-blue-600 py-2 rounded-lg"
          />
          <Button
            title="Zatwierdź"
            disabled={isCommitDisabled || useSupportMutation.isPending}
            onPress={submit}
            buttonClassName="bg-green py-2 rounded-lg disabled:bg-gray-300 mt-2"
          />
        </View>
      </View>
  );
};

export default Support;
