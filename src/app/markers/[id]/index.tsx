import PhotoGallery from "@components/photoGallery";
import SolutionStatusBadge from "@components/solutionStatusBadge";
import StatusBadge from "@components/statusBadge";
import { AntDesign } from "@expo/vector-icons";
import { useEditExternalMarkerPhotosModal } from "@hooks/modals/useEditExternalMarkerPhotosModal";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@ui/avatar";
import Button from "@ui/button";
import DividerWithText from "@ui/DividerWithText";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  const { EditExternalMarkerPhotosModal, openEditExternalMarkerPhotosModal } = useEditExternalMarkerPhotosModal({
    markerKey: id as string,
    refetch,
  });

  const photos =
    markerData?.fileNamesString?.map((uri: string, idx: number) => ({
      // @ts-ignore
      uri: process.env.EXPO_PUBLIC_API_URL + "/uploads/" + uri,
      blurhash: markerData.blurHashes[idx],
      confidence: markerData.confidences[idx],
    })) ?? [];

  const { data: markerSupportersData } = useQuery<
    { username: string; total: number; profileImageUrl?: string }[]
  >({
    queryKey: [`/markers/${id}/supporters`],
    enabled: !!id,
  });

  const markerStatus = markerData?.status ?? "pending";
  const disabled = (markerStatus !== "approved" && !markerData?.solvedAt);

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
          <DividerWithText>
            <View className="flex flex-row gap-x-2">
              <Text>
                Status znacznika
              </Text>
              <Tooltip delayDuration={150}>
                <TooltipTrigger>
                  <AntDesign name="questioncircleo" size={20} color="black" />
                </TooltipTrigger>
                <TooltipContent insets={insets} className="bg-white gap-y-4 pb-4">
                  <View>
                    <StatusBadge status="pending" />
                    <Text>
                      Weryfikacja w toku. Weryfikacja może przebiegać automatycznie (natychmiastowo) lub manualnie przez upoważnionego użytkownika.
                    </Text>
                  </View>
                  <View>
                    <StatusBadge status="denied" />
                    <Text>
                      Znacznik został uznany za nieprawidłowy. Jeśli uważasz że niesłusznie, skontaktuj się z użytkownikiem upoważnionym w celu manualnej weryfikacji.
                    </Text>
                  </View>
                  <View>
                    <StatusBadge status="approved" />
                    <Text>
                      Znacznik został zaakcpetowany. Użytkownicy mogą tworzyć jego rozwiązania.
                    </Text>
                  </View>
                </TooltipContent>
              </Tooltip>
            </View>
          </DividerWithText>
          <View className="flex-col p-4 gap-y-4">
            <View>
              <Text>Status weryfikacji wiarygodności zgłoszenia:</Text>
            </View>
            <View>
              <StatusBadge status={markerStatus} />
            </View>
            <View>
              <Text>Średnia pewność oceny: {Math.round(100 * photos.reduce((prev, curr) => prev + curr.confidence, 0) / photos.length)}%</Text>
            </View>
          </View>
          {markerStatus === 'approved' && (
          <View className="flex-col p-4 gap-y-4">
            <DividerWithText>
              <View className="flex flex-row gap-x-2">
                <Text>
                  Status rozwiązania
                </Text>
                <Tooltip delayDuration={150}>
                  <TooltipTrigger>
                    <AntDesign name="questioncircleo" size={20} color="black" />
                  </TooltipTrigger>
                  <TooltipContent insets={insets} className="bg-white gap-y-4 pb-4">
                    <View>
                      <SolutionStatusBadge status="pending" />
                      <Text>
                        Znacznik nie ma jeszcze zaakcpetowanego rozwiązania.
                      </Text>
                    </View>
                    <View>
                      <SolutionStatusBadge status="denied" />
                      <Text>
                        Rozwiązanie zostało odrzucone.
                      </Text>
                    </View>
                    <View>
                      <SolutionStatusBadge status="approved" />
                      <Text>
                        Rozwiązanie zostało zaakcpetowane, co oznacza że śmieci ze zdjęć zostały wyprzątane.
                      </Text>
                    </View>
                  </TooltipContent>
                </Tooltip>
              </View>
            </DividerWithText>
            <View>
              <SolutionStatusBadge status={markerData?.solvedAt ? 'approved' : 'pending'} />
            </View>
            <View>
              {markerData?.pendingVerificationsCount === 0 ? (
                <Link asChild href={`markers/${markerData?.id}/solvePreface`}>
                  <Button title="Podziel się rezultatem" disabled={disabled || !photos.length} />
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
        )}
        <DividerWithText>
          <View className="flex flex-row gap-x-2">
            <Text>
              Wsparcie znacznika
            </Text>
            <Tooltip delayDuration={150}>
              <TooltipTrigger>
                <AntDesign name="questioncircleo" size={20} color="black" />
              </TooltipTrigger>
              <TooltipContent insets={insets} className="bg-white gap-y-4 pb-4">
                <Text>
                  Uzytkownicy mogą dorzucać punkty wsparcia do puli danego zgłoszenia. W przypadku zaakcpetowania rozwiązania zostaną one rozdzielone pomiędzy uczestników.
                </Text>
              </TooltipContent>
            </Tooltip>
          </View>
        </DividerWithText>
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
                {/* {markerSupportersData?.length > 3 && (
                  <Button
                    title="Więcej"
                    onPress={() =>
                      router.push({
                        pathname: `markers/${markerData?.id}/supporters`,
                      })
                    }
                  />
                )} */}
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
              <ActivityIndicator color="#10a37f" />
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
