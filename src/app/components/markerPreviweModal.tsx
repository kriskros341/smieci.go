import { useQuery } from "@tanstack/react-query"
import { ActivityIndicator, Modal, Text, View } from "react-native"
import { useAxios } from "../../hooks/use-axios";
import { AxiosInstance } from "axios";

type MarkerData = {
  base64image: string,
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
    queryKey: [`/marker/${props.markerId}`],
    enabled: !!props.markerId,
  });

  const { data: user } = useQuery<any>({
    queryKey: [`/users/${marker?.userId}`],
    enabled: !!marker?.userId
  });

  let content = null;

  console.log({ user, marker })
  if (isPending) {
    content = <ActivityIndicator />
  } else {
    content = (
      <View>
        <Text>ten base64Image to zretardowany pomysl. trzeba przejsc na faktyczne pliki asap</Text>
        <Text>Issuer: {user?.username}</Text>
      </View>
    )
  }
  return content
}

export default MarkerPreview;