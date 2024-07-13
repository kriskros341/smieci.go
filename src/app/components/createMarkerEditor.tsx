import * as Location from 'expo-location';
import { useUser } from "@clerk/clerk-expo";
import { useAxios } from "../../hooks/use-axios";
import { _createMarker } from "../../api/markers";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from 'react';
import CameraViewHandler from './cameraViewHandler';
import { Pressable, TextInput, View } from 'react-native';
import { Image } from 'react-native';
import { Text } from 'react-native';
import Button from '../../ui/button';

type editorStateType = {
  location?: {
    lat: number,
    long: number,
  },
  base64Image?: string,
}

const getInitialEditorState = (): editorStateType => ({});

const useLocation = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['location'],
    queryFn: () => Location.getCurrentPositionAsync(),
  });
  return { location: data, isPending, error };
}

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
  modalVisibilityState: 'minimized' | 'fullscreen' | 'hidden', // Ostatni nie wystapi
  onSubmit: () => void,
  onMoveMarkerPress: (currentLocation: Coords, onSuccess: (newLocation: Coords) => void) => void
  fakeMarkerCoordinates?: Coords
  onMoveMarkerConfirm: () => void,
}

const CreateMarkerEditor = ({ onSubmit, onMoveMarkerPress, modalVisibilityState, fakeMarkerCoordinates, onMoveMarkerConfirm }: CreateMarkerEditorProps) => {
  const axios = useAxios();
  const user = useUser();
  const { editorState, changeEditorState, isPending } = useEditorState();

  const clearPhoto = () => {
    changeEditorState({ base64Image: undefined })
  }

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
    )
    onSubmit?.();
  }

  if (!editorState.base64Image) {
    return <CameraViewHandler onPicture={(result: any) => changeEditorState({ base64Image: result.base64 })} />
  }

  if (modalVisibilityState === 'minimized') {
    return (
      <View>
        <Text>latitude</Text>
        <TextInput value={editorState.location?.lat.toString()} editable={false} />
        <Text>longitude</Text>
        <TextInput value={editorState.location?.long.toString()} editable={false} />
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

  return (
    <>
      <View className="flex-1">
        <View
          className="relative w-full"
        >
          <Image
            className="w-full aspect-square"
            source={{uri: `data:image/png;base64,${editorState.base64Image}`}}
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
          >

          </Button>
        </Pressable>
      </View>
    </>
  )
}

export default CreateMarkerEditor;