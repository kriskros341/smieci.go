
import { useUser } from "@clerk/clerk-expo";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as ImagePicker from 'expo-image-picker';
import { Pressable, Text, TextInput, View } from 'react-native';
import { LatLng } from "react-native-maps";

import { _createMarker } from "@api/markers";
import { useEditorState } from '@sheets/AddMarkerSheet/helper';
import Button from '@ui/button';
import { hasCoords } from "@utils/hasCoords";
import PhotoGallery from "./photoGallery";

type CreateMarkerEditorProps = {
  onSubmit: () => void,
  moveMarker: (currentLocation: LatLng, onSuccess: (newLocation: LatLng) => void) => void
  editorState: ReturnType<typeof useEditorState>
}

const MarkerEditor = ({ onSubmit, moveMarker, editorState }: CreateMarkerEditorProps) => {
  const user = useUser();

  const onMoveMarker = () => {
    if (!hasCoords(editorState)) {
      return;
    }
    moveMarker(
      editorState,
      (location: LatLng) => editorState.changeEditorState({ ...location })
    );
  }
  const onPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      editorState.addPhotoUri(result.assets[0].uri)
    }
  }

  const d = editorState.photosUris.map((uri, idx) => ({ uri, blurhash: 'URFs0??uyCxu9DD*ozbZ-=%Moct5IVM_a#ae' }))

  return (
    <>
      <PhotoGallery photos={d} onPhoto={onPhoto} reorder={editorState.reorderPhotoUris} />
      <View className="">
        <Text>latitude</Text>
        <BottomSheetTextInput value={editorState.latitude?.toString()} editable={false} />
        <Text>longitude</Text>
        <BottomSheetTextInput value={editorState.longitude?.toString()} editable={false} />
        <Button
          title="Move marker"
          onPress={onMoveMarker}
        />
      </View>
      <Text>Issuer</Text>
      <TextInput value={user?.user!.username ?? ''} editable={false} />
      <Pressable>
        <Button
          title="Create Marker"
          onPress={onSubmit}
          disabled={!editorState.photosUris.length}
        >

        </Button>
      </Pressable>
    </>
  )
}

export default MarkerEditor;