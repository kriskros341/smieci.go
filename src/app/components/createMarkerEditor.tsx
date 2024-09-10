
import { useUser } from "@clerk/clerk-expo";
import { useAxios } from "../../hooks/use-axios";
import { _createMarker } from "../../api/markers";
import { useEffect, useRef, useState } from 'react';
import CameraViewHandler from './cameraViewHandler';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { Image } from 'react-native';
import { Text } from 'react-native';
import Button from '../../ui/button';
import { CameraView } from 'expo-camera';
import useLocation from "../../hooks/useLocation";
import { usePhotoModal } from "../photo";
import { router } from "expo-router";

type editorStateType = {
  location?: {
    lat: number,
    long: number,
  },
  uri?: string,
}

const getInitialEditorState = (): editorStateType => ({});

const useEditorState = () => {
  const [editorState, setEditorState] = useState(getInitialEditorState());
  const { location, isPending } = useLocation();
  
  const changeEditorState = (changes: Partial<editorStateType>) => {
    setEditorState({ ...editorState, ...changes });
  };

  useEffect(() => {
    if (location) {
      const changes = {
        location: {
          lat: location.coords.latitude,
          long: location.coords.longitude,
        },
      };
      changeEditorState(changes);
    }
  }, [location]);

  return { editorState, changeEditorState, isPending }
}

type Coords = { lat: number, long: number };

type CreateMarkerEditorProps = {
  onSubmit: () => void,
  onMoveMarkerPress: (currentLocation: Coords, onSuccess: (newLocation: Coords) => void) => void
  fakeMarkerCoordinates?: Coords
}

const CreateMarkerEditor = ({ onSubmit, onMoveMarkerPress, fakeMarkerCoordinates }: CreateMarkerEditorProps) => {
  const axios = useAxios();
  const user = useUser();
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    // No await intentional
    cameraRef.current?.takePictureAsync(
      {
        skipProcessing: true,
        onPictureSaved: (result) => {
          changeEditorState({ uri: result.uri })
        },
      }
    );
  }
  const { editorState, changeEditorState, isPending } = useEditorState();
  const [lastPhotoUri, showPhotoModal] = usePhotoModal();

  useEffect(() => {
    if (fakeMarkerCoordinates) {
      changeEditorState({ location: fakeMarkerCoordinates })
    }
  }, [fakeMarkerCoordinates])

  const onCreateMarkerPress = async () => {
    if (isPending) {
      return;
    }

    _createMarker(
      axios,
      {
        uri: lastPhotoUri!,
        lat: editorState.location!.lat,
        long: editorState.location!.long,
      },
    ).then(() => {
      onSubmit?.();
    })
  }

  const image = lastPhotoUri ? (
    <Image
      className="w-full aspect-square"
      source={{ uri: lastPhotoUri }}
      resizeMode="contain"
      onError={(error) => console.log(error.nativeEvent.error)}
      onLoad={() => console.log('Image loaded successfully')}
    />
  ) : (
    <View className="w-full aspect-square flex justify-center items-center">
      <ActivityIndicator />
    </View>
  )

  return (
    <>
      <View className="relative w-full">
        {image}
        <Pressable
          onPress={() => {
            showPhotoModal()
          }}
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
      <View className="">
        <Text>latitude</Text>
        <TextInput value={editorState.location?.lat.toString()} editable={false} />
        <Text>longitude</Text>
        <TextInput value={editorState.location?.long.toString()} editable={false} />
        <Button
          title="Move marker"
          onPress={() => onMoveMarkerPress(editorState.location!, (location: Coords) => changeEditorState({ location }))}
        >

        </Button>
      </View>
      <Text>Issuer</Text>
      <TextInput value={user?.user!.username ?? ''} editable={false} />
      <Pressable>
        <Button
          title="Create Marker"
          onPress={onCreateMarkerPress}
          disabled={!lastPhotoUri}
        >

        </Button>
      </Pressable>
    </>
  )
}

export default CreateMarkerEditor;