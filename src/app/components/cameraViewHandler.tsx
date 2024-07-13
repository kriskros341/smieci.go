import { router } from "expo-router";
import { ActivityIndicator, BackHandler, Image, Pressable, Text, TextInput, View } from "react-native"
import Button from "../../ui/button";
import { useEffect, useRef, useState } from "react";

import { CameraView, CameraCapturedPicture, useCameraPermissions } from "expo-camera";

type CameraViewProps = {
  onPicture: (picture: CameraCapturedPicture) => void
}

const CameraViewHandler = (props: CameraViewProps) => {
  const cameraRef = useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [permission, requestPermission] = useCameraPermissions();

  const takePictureAsync = async () => {
    setIsLoading(true);
    const photo = await cameraRef.current?.takePictureAsync({ base64: true });
    setIsLoading(false);
    if (photo) {
      props.onPicture(photo);
    }
  }

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
  }, []);

  if (!permission?.granted) {
    return null;
  }

  const onCameraReady = () => {
    setIsLoading(false);
  }

  return (
    <View className="flex-1 h-full">
      <CameraView
        onCameraReady={() => onCameraReady()}
        ref={cameraRef}
        className="absolute flex flex-1 w-full h-full align-center"
      >
      </CameraView>
      <View className="absolute flex items-center w-full bottom-16">
        {!isLoading ? (
          <Pressable onPress={() => takePictureAsync()}>
            {({ pressed }) => (
              <View
                className="inline-flex w-16 h-16 bg-white rounded-full"
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        ) : <ActivityIndicator size="large" />}
      </View>
    </View>
  )
}

export default CameraViewHandler;