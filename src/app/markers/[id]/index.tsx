import PhotoGallery from "@components/photoGallery";
import StatusBadge from "@components/statusBadge";
import { useEditExternalMarkerPhotosModal } from "@hooks/modals/useEditExternalMarkerPhotosModal";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@ui/avatar";
import Button from "@ui/button";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
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
  const { data: markerData } = useMarkerQuery(id as string);

  const { EditExternalMarkerPhotosModal, openEditExternalMarkerPhotosModal } =
    useEditExternalMarkerPhotosModal({
      markerKey: id as string,
    });

  const photos =
    markerData?.fileNamesString?.map((uri: string, idx: number) => ({
      uri: process.env.EXPO_PUBLIC_API_URL + "/uploads/" + uri,
      blurhash: markerData.blurHashes[idx],
    })) ?? [];

  const { data: markerSupportersData } = useQuery<
    { username: string; total: number; profileImageUrl?: string }[]
  >({
    queryKey: [`/markers/${id}/supporters`],
    enabled: !!id,
  });

  const markerStatus = (markerData?.status ?? "pending") as
    | "pending"
    | "approved"
    | "denied";

  const disabled = markerStatus !== "approved" && !markerData?.solvedAt;

  const verificationStatusSection = (
    <View className="flex-col p-4">
      <View className="flex-col gap-4">
        <Text>Status weryfikacji wiarygodności zgłoszenia</Text>
        <StatusBadge status={markerStatus} />
      </View>
      <View className="pt-4">
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
          <View className="flex flex-row gap-8 p-4">
            <View>
              <Text>Szerokość geograficzna</Text>
              <TextInput value={markerData?.lat?.toString()} editable={false} />
              <Text>Długość geograficzna</Text>
              <TextInput
                value={markerData?.long?.toString()}
                editable={false}
              />
            </View>
            <MapView
              customMapStyle={mapStyle}
              provider={undefined}
              className="w-24 h-24"
              showsUserLocation
              region={{
                latitude: markerData?.lat ?? 0,
                longitude: markerData?.lat ?? 0,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
            >
              <Marker
                key="jdjd"
                pinColor="green"
                coordinate={{
                  latitude: markerData?.lat ?? 0,
                  longitude: markerData?.lat ?? 0,
                }}
              />
            </MapView>
          </View>
          {verificationStatusSection}
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
        </View>
      </ScrollView>
      {EditExternalMarkerPhotosModal}
    </>
  );
};

export default MarkerPreview;
