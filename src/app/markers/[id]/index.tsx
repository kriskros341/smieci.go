import { useLocalSearchParams, useRouter } from "expo-router"
import Constants from "expo-constants";
import { ScrollView, Text, TextInput, View } from "react-native"
import PhotoGallery from "@components/photoGallery";
import { useQuery } from "@tanstack/react-query";
import MapView, { Marker } from "react-native-maps";
import Avatar from "@ui/avatar";
import Button from "@ui/button";

const mapStyle =
  [
    {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
  ]

const useMarkerQuery = (key: string) => {
  const data = useQuery<any>({
    queryKey: [`/markers/${key}`]
  })
  return data;
}

const PreviewMarkerModal = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams()
  const { data } = useMarkerQuery(id as string);

  const photos = data?.fileNamesString?.map((uri: string, idx: number) => ({
    uri: Constants?.expoConfig?.extra?.apiUrl + "/uploads/" + uri,
    blurhash: data.blurHashes[idx]
  })) ?? []

  return (
    <ScrollView>
      <View className="flex-1 w-full h-full bg-transparent">
        <PhotoGallery
          photos={[...photos]}
          isDragDisabled
        />
        <View className="p-4 flex flex-row gap-8">
          <View>
            <Text>latitude</Text>
            <TextInput value={data?.lat?.toString()} editable={false} />
            <Text>longitude</Text>
            <TextInput value={data?.long?.toString()} editable={false} />
          </View>
          <MapView
            customMapStyle={mapStyle}
            provider={undefined}
            className="h-24 w-24"
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
              pinColor={'green'}
              //@ts-ignore
              coordinate={{
                latitude: data?.lat ?? 0,
                longitude: data?.lat ?? 0,
              }}
            />
          </MapView>
        </View>

        <View className="p-4">
          <Text>This marker is HOT rn.</Text>
          <Text>You can support it by clicking here</Text>
          <Text>Point count: {4000}</Text>
          <Text>Gathered from {4} supporters</Text>
          <Text> list of profile few pics, clicking opens list modal </Text>
          <View className="flex flex-row py-4">
            {photos?.splice(0, 3).map((item: any, index: number) => (
              <View className="pr-4">
                <Avatar imageUrl={item.uri} className="mr-4" />
              </View>
            ))}
            <Button title="Więcej" onPress={() => router.push({ pathname: `markers/${data.id}/supporters`})} />
          </View>
        </View>
      </View>

      <View>
        <Button title="Wesprzyj" onPress={() => router.push({ pathname: `markers/${data.id}/support`})}  />
      </View>
    </ScrollView>
  )
}

export default PreviewMarkerModal