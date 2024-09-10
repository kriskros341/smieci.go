import { View } from "react-native";
import CameraViewHandler from "../components/cameraViewHandler";
import { router } from "expo-router";
import { useRef } from "react";
import { CameraView } from "expo-camera";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePhotoModal = () => {
  const queryClient = useQueryClient();
  const { data: lastPhotoUri } = useQuery<string | null>({
    queryKey: ['internal', 'photoUri'],
    queryFn: () => queryClient.getQueryData(['internal', 'photoUri']) ?? null,
    staleTime: Infinity,
  })
  const showPhotoModal = () => {
    router.push('/photo');
  }
  return [lastPhotoUri, showPhotoModal] as const
}

const Photo = () => {
  const queryClient = useQueryClient();
  const cameraRef = useRef<CameraView>(null);
  const takePicture = async () => {
    // No await intentional
    cameraRef.current?.takePictureAsync(
      {
        skipProcessing: true,
        onPictureSaved: (result) => {
          queryClient.setQueryData(['internal', 'photoUri'], result.uri);
          queryClient.invalidateQueries({ queryKey: ['internal', 'photoUri'], exact: true });
          router.back()
        },
      }
    );
  }
    return (
      <View className={`h-full`}>
        <CameraViewHandler ref={cameraRef} onPicture={takePicture} />
      </View>
    )
}

export default Photo;