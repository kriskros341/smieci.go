import { router } from "expo-router";
import { ActivityIndicator, BackHandler, Image, Pressable, Text, TextInput, View } from "react-native"
import Button from "../../../ui/button";
import { useEffect, useRef, useState } from "react";

import { Camera, CameraView, CameraCapturedPicture, useCameraPermissions,  } from "expo-camera";

type CameraViewProps = {
  onPhoto: (photo: CameraCapturedPicture) => void
}

const CameraViewHandler = (props: CameraViewProps) => {
  const cameraRef = useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    async function getSizes() {
      console.log("hi!");
      console.log(permission);
      if (permission?.granted && cameraRef.current) {
        console.log("sized!");
      }
    }

    getSizes();
  }, [permission, cameraRef]);

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
    const photo = await cameraRef.current?.takePictureAsync({ base64: true });
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

import * as Location from 'expo-location';
import { useUser } from "@clerk/clerk-expo";
import { useAxios } from "../../../hooks/use-axios";
import { _createMarker } from "../../../api/markers";

const CreateMarker = () => {
  const axios = useAxios();
  const [location, setLocation] = useState<Location.LocationObject>();
  const [tempPhoto, setTempPhoto] = useState<string>()
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

  if (!tempPhoto) {
    return <CameraViewHandler onPhoto={(photo) => setTempPhoto(photo.base64)} />
  }

  const clearPhoto = () => {
    setTempPhoto(undefined)
  }

  console.log({ tempPhoto: !!tempPhoto })

  const onCreateMarkerPress = () => {
    const result = _createMarker(
      axios,
      {
        base64Image: tempPhoto,
        lat: location!.coords.latitude,
        long: location!.coords.longitude,
      },
    )
    .then((response) => {
      router.replace('map')
    })
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
            source={{uri: `data:image/png;base64,${tempPhoto}`}}
            resizeMode="contain"
            onError={(error) => console.log(error.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully')}
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
        <View>
          <Text>latitude</Text>
          <TextInput value={location?.coords.latitude.toString()} editable={false} />
          <Text>longitude</Text>
          <TextInput value={location?.coords.longitude.toString()} editable={false} />
        </View>
        <Text>Issuer</Text>
        <TextInput value={user?.user!.username ?? ''} editable={false} />
        <Pressable>
          <Button
            title="Create Marker"
            onPress={onCreateMarkerPress}
          >

          </Button>
        </Pressable>
      </View>
    </>
  )
}

export default CreateMarker;