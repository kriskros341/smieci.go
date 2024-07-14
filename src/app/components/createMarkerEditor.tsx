
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

type editorStateType = {
  location?: {
    lat: number,
    long: number,
  },
  base64Image?: string,
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
  modalVisibilityState: 'minimal' | 'fullscreen' | 'hidden',
  onSubmit: () => void,
  onMoveMarkerPress: (currentLocation: Coords, onSuccess: (newLocation: Coords) => void) => void
  fakeMarkerCoordinates?: Coords
  onMoveMarkerConfirm: () => void,
}

const CreateMarkerEditor = ({ onSubmit, onMoveMarkerPress, modalVisibilityState, fakeMarkerCoordinates, onMoveMarkerConfirm }: CreateMarkerEditorProps) => {
  
  const axios = useAxios();
  const user = useUser();
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    const WAIT_AFTER_PHOTO = 1000;
    setTimeout(() => setIsCameraActive(false), WAIT_AFTER_PHOTO)
    // No await intentional
    cameraRef.current?.takePictureAsync(
      {
        base64: true,
        skipProcessing: true,
        onPictureSaved: (result) => {
          changeEditorState({ base64Image: result.base64 })
        },
      }
    );

  }
  const { editorState, changeEditorState, isPending } = useEditorState();

  const [isCameraActive, setIsCameraActive] = useState(true);

  const clearPhoto = () => {
    changeEditorState({ base64Image: undefined })
  }

  useEffect(() => {
    if (fakeMarkerCoordinates) {
      changeEditorState({ location: fakeMarkerCoordinates })
    }
  }, [fakeMarkerCoordinates])

  const onCreateMarkerPress = () => {
    if (isPending) {
      return;
    }

    _createMarker(
      axios,
      {
        base64Image: editorState.base64Image!,
        lat: editorState.location!.lat,
        long: editorState.location!.long,
      },
    ).then(() => {
      onSubmit?.();
    })
  }

  if (modalVisibilityState === 'minimal') {
    return (
      <View>
        <Text>latitude</Text>
        <TextInput value={fakeMarkerCoordinates?.lat.toString()} editable={false} />
        <Text>longitude</Text>
        <TextInput value={fakeMarkerCoordinates?.long.toString()} editable={false} />
        <View className="flex flex-row">
          <Button
            title="Move marker"
            onPress={() => {
              onMoveMarkerConfirm?.();
              changeEditorState({ location: fakeMarkerCoordinates })
            }}
          />
          {/* <Button
            title="Cancel"
            onPress={() => onCancelMoveMarker()}
          /> */}
        </View>
      </View>
    )
  }

  const isImageReady = !!editorState.base64Image;
  const image = isImageReady ? (
    <Image
      className="w-full aspect-square"
      source={{uri: `data:image/png;base64,${editorState.base64Image}`}}
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
      <View className={`flex-1 h-full ${isCameraActive ? '' : 'hidden'}`}>
        <CameraViewHandler ref={cameraRef} onPicture={takePicture} />
      </View>
      <View className={`flex-1 ${!isCameraActive ? '' : 'hidden'}`}>
        <View
          className="relative w-full"
        >
          {image}
          {isImageReady ? (
            <Pressable
              onPress={() => {
                setIsCameraActive(true)
                clearPhoto()
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
          ) : null}
        </View>
        <View>
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
            disabled={!isImageReady}
          >

          </Button>
        </Pressable>
      </View>
    </>
  )
}

export default CreateMarkerEditor;