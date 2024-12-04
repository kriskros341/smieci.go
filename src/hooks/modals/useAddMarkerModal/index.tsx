import { useEffect, useState } from "react";
import { LatLng } from "react-native-maps";

import MarkerEditor from "@components/editors/MarkerEditor";
import { useCreateMarkerMutation, useEditorState } from "./helper";
import { Modal } from "react-native";

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

  const onSubmit = () => {
    createMarkersMutation.mutate(editorState);
    setIsModalVisible(false);
  };

  useEffect(() => {
    return () => {
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
      <MarkerEditor
        editorState={editorState}
        onSubmit={onSubmit}
        moveMarker={onMoveMarkerPress}
        isPending={createMarkersMutation.isPending}
      />
    </Modal>
  );

  return {
    isModalVisible,
    setIsModalVisible,
    setMarkerCoordinates,
    AddMarkerModal,
  } as const
};
