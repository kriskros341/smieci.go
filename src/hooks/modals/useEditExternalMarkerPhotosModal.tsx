import { useState } from "react";
import { Modal, Pressable, SafeAreaView } from "react-native";
import PhotoGallery from "@components/photoGallery";
import { editorStateType, useEditorState } from "@sheets/AddMarkerSheet/helper";

import * as ImagePicker from "expo-image-picker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Button from "@ui/button";
import { _modifyExternalMarkerMutation } from "@api/markers";
import { useAxios } from "@hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type EditExternalMarkerPhotosModalOptions = {
  props: editorStateType,
}

type MarkerPayload = {
  photosUris: string[];
};

type useModifyExternalMarkerMutationOptions = {
  markerKey: string,
  onSettled?: Function;
};

export const useModifyExternalMarkerMutation = (
  options: useModifyExternalMarkerMutationOptions,
) => {
  const queryClient = useQueryClient();
  const axios = useAxios();
  const ModifyExternalMarkersMutation = useMutation<
    unknown,
    MarkerPayload,
    { photosUris: string[] }
  >({
    mutationFn: async ({ photosUris }) => {
      const payload = {
        uris: photosUris,
      };
      return _modifyExternalMarkerMutation(axios, options.markerKey, payload);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["/markers"] });
      options?.onSettled?.();
    },
  });
  return ModifyExternalMarkersMutation;
};

type useEditExternalMarkerPhotosModalOptions = {
  markerKey: string
}

export const useEditExternalMarkerPhotosModal = (props: useEditExternalMarkerPhotosModalOptions) => {
  const editorState = useEditorState();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const openEditExternalMarkerPhotosModal = (modalOptions: EditExternalMarkerPhotosModalOptions) => {
    editorState.changeEditorState(modalOptions.props)
    setIsModalVisible(true);
    console.log("modal should have opened");
  };

  const photos = editorState.photosUris.map((uri) => ({ uri }))


  const onPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      editorState.addPhotoUri(result.assets[0].uri);
    }
  };

  const mutation = useModifyExternalMarkerMutation({ markerKey: props.markerKey })

  const onSubmit = () => {
    mutation.mutate({ photosUris: editorState.photosUris })
  };

  const EditExternalMarkerPhotosModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        console.log("close");
      }}
    >
      <SafeAreaView>
        <GestureHandlerRootView className="w-screen h-full">
          <PhotoGallery photos={photos} onPhoto={onPhoto} showAddPhotoButton />
          <Pressable className="p-4">
            <Button
              title="Dodaj zdjęcia"
              onPress={onSubmit}
              disabled={!editorState.photosUris.length || mutation.isPending}
            />
          </Pressable>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  );

  return {
    EditExternalMarkerPhotosModal,
    openEditExternalMarkerPhotosModal,
  };
};
