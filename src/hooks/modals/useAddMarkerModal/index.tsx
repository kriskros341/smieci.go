import { useEffect, useState } from "react";
import { LatLng } from "react-native-maps";

import MarkerEditor from "@components/editors/MarkerEditor";
import { useCreateMarkerMutation, useEditorState } from "./helper";
import { ActivityIndicator, Modal, View } from "react-native";

type useAddMarkerModalOptions = {
  onMoveMarkerPress: () => void,
  onCancel: () => void,
}

export const useAddMarkerModal = (options: useAddMarkerModalOptions) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const editorState = useEditorState();
  const createMarkersMutation = useCreateMarkerMutation();

  const onMoveMarkerPress = () => {
    setIsModalVisible(false)
    options.onMoveMarkerPress?.()
  };

  const setMarkerCoordinates = (coords: LatLng) => {
    setIsModalVisible(true)
    editorState.changeEditorState({ ...coords });
  };

  const onSubmit = async () => {
    await createMarkersMutation.mutateAsync(editorState);
    editorState.reset();
    setIsModalVisible(false);
    options.onCancel?.()
  };

  useEffect(() => {
    return () => {
      editorState.reset();
      options.onCancel?.()
    }
  }, [])

  const AddMarkerModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        console.log("close");
      }}
    >
      {createMarkersMutation.isPending ? (
        <View className="flex-1 justify-center">
          <ActivityIndicator size="large" color="#10a37f" />
        </View>
      ) : (
        <MarkerEditor
          editorState={editorState}
          onSubmit={onSubmit}
          moveMarker={onMoveMarkerPress}
          isPending={createMarkersMutation.isPending}
        />
      )}
    </Modal>
  );

  return {
    isModalVisible,
    setIsModalVisible,
    setMarkerCoordinates,
    AddMarkerModal,
  } as const
};
