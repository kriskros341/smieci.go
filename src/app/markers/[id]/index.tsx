import PhotoGallery from "@components/photoGallery";
import StatusBadge from "@components/statusBadge";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@ui/avatar";
import Button from "@ui/button";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const mapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];

const MarkerPreview = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data } = useMarkerQuery(id);

  const photos =
    data?.fileNamesString?.map((uri: string, idx: number) => ({
      uri: process.env.EXPO_PUBLIC_API_URL + "/uploads/" + uri,
      blurhash: data.blurHashes[idx],
    })) ?? [];

  const { data: markerSupportersData } = useQuery<
    { username: string; total: number; profileImageUrl?: string }[]
  >({
    queryKey: [`/markers/${id}/supporters`],
    enabled: !!id,
  });

  const verificationStatusSection = (
    <View className="flex-col p-4">
      <View className="flex-row gap-4 ">
        <Text>Status weryfikacji:</Text>
        <StatusBadge pendingVerificationsCount={data?.pendingVerificationsCount || 0} />
      </View>
      <View className="pt-4">
        {data?.pendingVerificationsCount === 0 ? (
          <Link asChild href={`markers/${data?.id}/solvePreface`}>
            <Button title="Podziel się rezultatem" />
          </Link>
        ) : (
          <Link
            asChild
            href={`markers/${data?.id}/solution/${data?.latestSolutionId}`}
          >
            <Button title="Wyświetl rozwiązanie" />
          </Link>
        )}
      </View>
    </View>
  );

  const [r, setR] = useState(false);

  return (
    <>
      <ScrollView>
        <Button title="rerender" onPress={() => setR(!r)} />
          <Text>{r ? '1' : '0'}</Text>
        <View className="flex-1 w-full h-full bg-transparent">
          <PhotoGallery photos={[...photos]} isDragDisabled />
          <View className="flex flex-row gap-8 p-4">
            <View>
              <Text>latitude</Text>
              <TextInput value={data?.lat?.toString()} editable={false} />
              <Text>longitude</Text>
              <TextInput value={data?.long?.toString()} editable={false} />
            </View>
            <MapView
              customMapStyle={mapStyle}
              provider={undefined}
              className="w-24 h-24"
              showsUserLocation
              region={{
                latitude: data?.lat ?? 0,
                longitude: data?.lat ?? 0,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
            >
              <Marker
                key="jdjd"
                pinColor="green"
                coordinate={{
                  latitude: data?.lat ?? 0,
                  longitude: data?.lat ?? 0,
                }}
              />
            </MapView>
          </View>
          {verificationStatusSection}
          <View className="p-4">
            <Text>You can support it by clicking here</Text>
            <Text>Point count: {data?.points}</Text>
            <Text>Gathered from {markerSupportersData?.length} supporters</Text>
          </View>
          <View className="p-4">
            {markerSupportersData && markerSupportersData?.length !== 0 ? (
              <View className="flex flex-row py-4">
                {markerSupportersData?.splice(0, 3).map((item, index: number) => (
                  <View className="relative pr-4">
                    <Avatar imageUrl={item.profileImageUrl} className="mr-4" />
                    <View className="absolute bottom-0 right-0">
                      <Text>{item.total}</Text>
                    </View>
                  </View>
                ))}
                {markerSupportersData?.length > 3 && (
                  <Button
                    title="Więcej"
                    onPress={() =>
                      router.push({ pathname: `markers/${data?.id}/supporters` })
                    }
                  />
                )}
              </View>
            ) : (
              <View className="py-4">
                <Text>This marker has no supporters yet.</Text>
              </View>
            )}
            <Button
              title="Wesprzyj"
              onPress={() =>
                router.push({ pathname: `markers/${data?.id}/support` })
              }
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default MarkerPreview;
