import { useQuery } from "@tanstack/react-query"
import { ActivityIndicator, Modal, Text, View } from "react-native"
import { Image } from 'expo-image'
import { useAxios } from "../../hooks/use-axios";
import { _getUploadById } from "../../api/uploads";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { decode } from "blurhash";
import { Blurhash } from "react-native-blurhash";

const ImageFromUri = (props: { uri: string, blurhash: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  console.log({ test: props.blurhash })
  return (
    <View className="relative items-center justify-center">
      <Image
        source={Constants?.expoConfig?.extra?.apiUrl + "/uploads/" + props.uri}
        style={{width: '100%', height: '75%'}}
        className="flex"
        placeholder={{ blurhash: props.blurhash }}
        contentFit="cover"
        transition={100}
        onLoadStart={() => {
          setIsLoading(true)
        }}
        onLoadEnd={() => {
          setIsLoading(false)
        }}
      >
      </Image>
      <View
        className="absolute flex align-middle justify-center"
      >
        {isLoading && (<ActivityIndicator />)}
      </View>
    </View>
  )
}

type MarkerData = {
  blurHashes: string[],
  fileNamesString: string[],
  coords: {
    lat: number,
    long: number,
  },
  text: string,
  userId: string,
}


type MarkerPreviewProps = {
  markerId?: string,
}

const MarkerPreview = (props: MarkerPreviewProps) => {
  const { isPending, data: marker } = useQuery<MarkerData>({
    queryKey: [`/markers/${props.markerId}`],
    enabled: !!props.markerId,
  });

  const uris = marker?.fileNamesString ?? [];
  const placeholders = marker?.blurHashes ?? []

  console.log({ marker })

  const { data: user } = useQuery<any>({
    queryKey: [`/users/${marker?.userId}`],
    enabled: !!marker?.userId
  });

  // useEffect(() => {
  //   // KCTODO temp
  //   Image.clearMemoryCache()
  //   Image.clearDiskCache()
  // }, [])

  let content = null;
  if (isPending) {
    content = <ActivityIndicator />
  } else {
    content = (
      <View>
        {uris.map((uri, index) => (
          <ImageFromUri key={uri} uri={uri} blurhash={placeholders[index]} />
        ))}
        <Text>ten base64Image to zretardowany pomysl. trzeba przejsc na faktyczne pliki asap</Text>
        <Text>Issuer: {user?.username}</Text>
      </View>
    )
  }
  return content
}

export default MarkerPreview;