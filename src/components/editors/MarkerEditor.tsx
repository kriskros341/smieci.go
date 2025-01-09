import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { Pressable, Text, TextInput, View } from "react-native";
import { LatLng } from "react-native-maps";

import Button from "@/ui/button";
import { hasCoords } from "@/utils/hasCoords";

import PhotoGallery from "../photoGallery";
import { useEditorState } from "@hooks/modals/useAddMarkerModal/helper";
import { ScrollView } from "react-native-gesture-handler";

type CreateMarkerEditorProps = {
  onSubmit: () => void;
  moveMarker: (
    currentLocation: LatLng,
    onSuccess: (newLocation: LatLng) => void,
  ) => void;
  editorState: ReturnType<typeof useEditorState>;
  isPending: boolean;
};

const MarkerEditor = ({
  onSubmit,
  moveMarker,
  editorState,
  isPending,
}: CreateMarkerEditorProps) => {
  const user = useUser();

  const onMoveMarker = () => {
    if (!hasCoords(editorState)) {
      return;
    }
    moveMarker(editorState, (location: LatLng) =>
      editorState.changeEditorState({ ...location }),
    );
  };

  const onPhoto = async (index?: number) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      editorState.addPhotoUri(result.assets[0].uri);
    }
  };

  const d = editorState.photosUris.map((uri, idx) => ({
    uri,
    blurhash: "URFs0??uyCxu9DD*ozbZ-=%Moct5IVM_a#ae",
  }));

  return (
    <ScrollView>
      <PhotoGallery
        photos={d}
        onPhoto={onPhoto}
        reorder={editorState.reorderPhotoUris}
        showAddPhotoButton
        showActionsMenu
      />
      <View className="p-4">
        <Text>Szerokość geograficzna</Text>
        <TextInput
          value={editorState.latitude?.toString()}
          editable={false}
        />
        <Text>Długość geograficzna</Text>
        <TextInput
          value={editorState.longitude?.toString()}
          editable={false}
        />
        <Button title="Przemieść" buttonClassName="rounded-lg" onPress={onMoveMarker} />
      </View>
      <View className="p-4">
        <Text>Odpowiedzialny</Text>
        <TextInput value={user?.user!.username ?? ""} editable={false} />
        <Pressable>
          <Button
            buttonClassName="rounded-lg"
            title="Utwórz znacznik"
            onPress={onSubmit}
            disabled={!editorState.photosUris.length || isPending}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default MarkerEditor;
