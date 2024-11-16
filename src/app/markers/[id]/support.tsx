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

  const { data: markerData, refetch: refetchMarkerData } = useQuery<any>({
    queryKey: [`/markers/${id}`],
  });

  const updateFinalDelta = () => {
    setDelta(0);
    setFinalDelta(finalDelta + delta * multiplier);
  };

  const useSupportMutation = useMutation({
    mutationFn: () => {
      if (!user?.id || !markerData?.id) {
        throw new Error("Wystąpił błąd");
      }

      return _supportMarker(axios, {
        userId: user.id,
        markerId: markerData.id,
        amount: finalDelta,
      });
    },
    onSuccess: () => {
      refetchMarkerData();
      queryClient.invalidateQueries({
        queryKey: [`/markers/${id}/supporters`],
      });
      router.back();
    },
  });

  const isCommitDisabled = markerData?.points + finalDelta < 0;
  return (
    <View className="flex gap-2">
      <Text>Dostępne punkty {userData?.supportPoints}</Text>
      <View className="flex flex-row w-full">
        <View className="flex-1">
          <Button
            textClassName="text-center"
            title="1"
            onPress={() => setMultiplier(1)}
          />
        </View>
        <View className="flex-1">
          <Button
            textClassName="text-center"
            title="10"
            onPress={() => setMultiplier(10)}
          />
        </View>
        <View className="flex-1">
          <Button
            textClassName="text-center"
            title="100"
            onPress={() => setMultiplier(100)}
          />
        </View>
      </View>
      <Text>Mnożnik x{multiplier}</Text>
      <View className="flex flex-row">
        <View className="flex-1">
          <Button
            textClassName="text-center"
            title="+"
            onPress={() => setDelta(delta + 1)}
          />
        </View>
        <View className="flex-1">
          <Button
            textClassName="text-center"
            title="-"
            onPress={() => setDelta(delta - 1)}
          />
        </View>
      </View>
      <View>
        <Text>Zmień o {delta * multiplier}</Text>
      </View>
      <View>
        <Button title="aplikuj" onPress={updateFinalDelta} />
      </View>
      <Text>Punkty zgłoszenia {markerData?.points + finalDelta}</Text>
      <View>
        <Button
          title="Zatwierdź"
          disabled={isCommitDisabled || useSupportMutation.isPending}
          onPress={useSupportMutation.mutate}
        />
      </View>
    </View>
  );
};

export default Support;
