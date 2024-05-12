import { router } from "expo-router";
import { ActivityIndicator, BackHandler, Image, Pressable, Text, TextInput, View } from "react-native"
import Button from "../../../ui/button";
import { useEffect, useRef, useState } from "react";

import { Camera, CameraCapturedPicture } from "expo-camera";

type CameraViewProps = {
  onPhoto: (photo: CameraCapturedPicture) => void
}

const CameraView = (props: CameraViewProps) => {
  const cameraRef = useRef<Camera>(null);
  const [isLoading, setIsLoading] = useState(true)
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.navigate('map')
        return true;
      },
    );
    return () => backHandler.remove()
  }, []);

  const takePictureAsync = async () => {
    setIsLoading(true);
    const photo = await cameraRef.current?.takePictureAsync();
    setIsLoading(false);
    if (photo) {
      props.onPhoto(photo);
    }
  }

  if (!permission?.granted) {
    return (
      <View className="justify-center flex-1 h-full p-4">
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const onCameraReady = () => {
    setIsLoading(false);
    console.log("camera ready");
  }

  console.log({ isLoading })

  return (
    <View className="flex-1 h-full">
      <View className="h-8" />
      <Camera
        onCameraReady={() => onCameraReady()}
        ref={cameraRef}
        className="absolute flex flex-1 w-full h-full align-center"
      >
      </Camera>
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

import * as Location from 'expo-location';
import { useUser } from "@clerk/clerk-expo";

const CreateMarker = () => {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [tempPhotoUri, setTempPhotoUri] = useState<string>()
  const user = useUser();
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.navigate('map')
        return true;
      },
    );
    return () => backHandler.remove()
  }, []);

  
  useEffect(() => {
    (async () => {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location!)
    })();
  }, []);

  if (!tempPhotoUri) {
    return <CameraView onPhoto={(photo) => setTempPhotoUri(photo.uri)} />
  }

  const clearPhoto = () => {
    setTempPhotoUri(undefined)
  }


  return (
    <>
      <View className="h-8" />
      <View className="flex-1">
        <View
          className="relative w-full"
        >
          <Image
            className="w-full aspect-square"
            src={tempPhotoUri}
          />
          <Pressable
            onPress={() => clearPhoto()}
          >
            {({ pressed }) => (
              <View
                style={{ opacity: pressed ? 0.5 : 1 }}
                className="absolute w-16 h-16 bg-white rounded-full bottom-4 right-4"
              >
                <Text>retake</Text>
              </View>
            )}
          </Pressable>
        </View>
        <Text>latitude</Text>
        <TextInput value={location?.coords.latitude.toString()} editable={false} />
        <Text>longitude</Text>
        <TextInput value={location?.coords.longitude.toString()} editable={false} />
        <Text>Issuer</Text>
        <TextInput value={user?.user!.username ?? ''} editable={false} />
      </View>
    </>
  )
}

export default CreateMarker;