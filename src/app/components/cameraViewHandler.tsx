import { router } from "expo-router";
import { ActivityIndicator, BackHandler, Image, Pressable, Text, TextInput, View } from "react-native"
import Button from "../../ui/button";
import { forwardRef, useEffect, useRef, useState } from "react";

import { CameraView, CameraCapturedPicture, useCameraPermissions } from "expo-camera";

type CameraViewProps = {
  onPicture: () => void,
}

const CameraViewHandler = forwardRef((props: CameraViewProps, cameraRef: any) => {
  const [isLoading, setIsLoading] = useState(true);

  const [permission, requestPermission] = useCameraPermissions();

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
    <>
      <CameraView
        onCameraReady={() => onCameraReady()}
        ref={cameraRef}
        className="absolute flex flex-1 w-full h-full align-center"
      >
      </CameraView>
      <View className="absolute flex items-center w-full bottom-16">
        {!isLoading ? (
          <Pressable onPress={props.onPicture}>
            {({ pressed }) => (
              <View
                className="inline-flex w-16 h-16 bg-white rounded-full"
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        ) : <ActivityIndicator size="large" />}
      </View>
    </>
  )
});

export default CameraViewHandler;