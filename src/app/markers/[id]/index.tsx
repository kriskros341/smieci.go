import PhotoGallery from "@components/photoGallery";
import StatusBadge from "@components/statusBadge";
import { useEditExternalMarkerPhotosModal } from "@hooks/modals/useEditExternalMarkerPhotosModal";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@ui/avatar";
import Button from "@ui/button";
import DividerWithText from "@ui/DividerWithText";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL: string,
  }
}

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
  const { data: markerData, refetch } = useMarkerQuery(id as string);

  const { EditExternalMarkerPhotosModal, openEditExternalMarkerPhotosModal } = useEditExternalMarkerPhotosModal({
    markerKey: id as string,
    refetch,
  });

  const photos =
    markerData?.fileNamesString?.map((uri: string, idx: number) => ({
      // @ts-ignore
      uri: process.env.EXPO_PUBLIC_API_URL + "/uploads/" + uri,
      blurhash: markerData.blurHashes[idx],
    })) ?? [];

  const { data: markerSupportersData } = useQuery<
    { username: string; total: number; profileImageUrl?: string }[]
  >({
    queryKey: [`/markers/${id}/supporters`],
    enabled: !!id,
  });

  const markerStatus = markerData?.status ?? "pending";

  const disabled = markerStatus !== "approved" && !markerData?.solvedAt;

  const verificationStatusSection = (
    <>
      <DividerWithText>Status znacznika</DividerWithText>
      <View className="flex-col p-4 gap-y-4">
        <View>
          <Text>Status weryfikacji wiarygodności zgłoszenia:</Text>
        </View>
        <View>
          <StatusBadge status={markerStatus} />
        </View>
        <View>
          {markerData?.pendingVerificationsCount === 0 ? (
            <Link asChild href={`markers/${markerData?.id}/solvePreface`}>
              <Button title="Podziel się rezultatem" disabled={disabled} />
            </Link>
          ) : (
            <Link
              asChild
              href={`markers/${markerData?.id}/solution/${markerData?.latestSolutionId}`}
            >
              <Button title="Wyświetl rozwiązanie" />
            </Link>
          )}
        </View>
      </View>
    </>
  );

  const onPhoto = () => {
    if (!markerData?.externalObjectId) {
      return;
    }

    openEditExternalMarkerPhotosModal(photos);
  };

  console.log({ markerData });

  return (
    <>
      <ScrollView>
        <View className="flex-1 w-full h-full bg-transparent">
          {markerData?.externalObjectId && (
            <View className="p-4">
              <Text>
                Zgłoszenie pochodzi z systemu państwowego. Każdy użytkownik może
                zaproponować jego zmiany które następnie zostaną zweryfikowane.
              </Text>
            </View>
          )}
          <PhotoGallery
            photos={[...photos]}
            showAddPhotoButton={!!markerData?.externalObjectId}
            isDragDisabled
            onPhoto={onPhoto}
            disabled={disabled}
          />
          {verificationStatusSection}
          <DividerWithText>Wsparcie znacznika</DividerWithText>
          <View className="p-4">
            <Text>
              Liczba zebranych punktów wsparcia: {markerData?.points ?? 0}.
            </Text>
            <Text>
              Liczba wspierających: {markerSupportersData?.length ?? 0}.
            </Text>
          </View>
          <View className="p-4">
            {markerSupportersData && markerSupportersData?.length !== 0 ? (
              <View className="flex flex-row py-4">
                {markerSupportersData
                  ?.slice(0, 3)
                  .map((item, index: number) => (
                    <View className="relative pr-4" key={index}>
                      <Avatar
                        imageUrl={item.profileImageUrl}
                        className="mr-4"
                      />
                      <View className="absolute bottom-0 right-0">
                        <Text>{item.total}</Text>
                      </View>
                    </View>
                  ))}
                {markerSupportersData?.length > 3 && (
                  <Button
                    title="Więcej"
                    onPress={() =>
                      router.push({
                        pathname: `markers/${markerData?.id}/supporters`,
                      })
                    }
                  />
                )}
              </View>
            ) : (
              <View className="py-4">
                <Text>Ten znacznik nie posiada jeszcze wspierających.</Text>
              </View>
            )}
            <Button
              title="Wesprzyj"
              onPress={() =>
                router.push({ pathname: `markers/${markerData?.id}/support` })
              }
              disabled={disabled}
            />
          </View>
          <DividerWithText>Lokalizacja znacznika</DividerWithText>
          {markerData?.lat && markerData?.long ? (
            <MapView
              customMapStyle={mapStyle}
              provider={undefined}
              className="w-full aspect-square"
              showsUserLocation
              region={{
                latitude: markerData?.lat,
                longitude: markerData?.long,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
            >
              <Marker
                key="jdjd"
                pinColor="green"
                coordinate={{
                  latitude: markerData?.lat,
                  longitude: markerData?.long,
                }}
              />
            </MapView>
          ) : (
            <View className="w-full aspect-square">
              <ActivityIndicator />
            </View>
          )}
          <View className="flex flex-col p-4">
            <View className="flex flex-col">
              <View>
                <Text>Szerokość geograficzna</Text>
              </View>
              <View>
                <TextInput value={markerData?.lat?.toString()} editable={false} />
              </View>
            </View>
            <View className="flex flex-col">
              <Text>Długość geograficzna</Text>
              <TextInput
                value={markerData?.long?.toString()}
                editable={false}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {EditExternalMarkerPhotosModal}
    </>
  );
};

export default MarkerPreview;
