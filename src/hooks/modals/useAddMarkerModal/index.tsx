import { useEffect, useState } from "react";
import { LatLng } from "react-native-maps";

import MarkerEditor from "@components/editors/MarkerEditor";
import { useCreateMarkerMutation, useEditorState } from "./helper";
import { ActivityIndicator, Modal, View } from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { Text } from "@ui/text";

type useAddMarkerModalOptions = {
  onMoveMarkerPress: () => void,
  resetMapStrategy: () => void,
}

export const useAddMarkerModal = (options: useAddMarkerModalOptions) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter()

  const editorState = useEditorState();
  const createMarkersMutation = useCreateMarkerMutation();
  const [codeErrorMessage, setCodeErrorMessage] = useState("")

  const onMoveMarkerPress = () => {
    setIsModalVisible(false)
    options.onMoveMarkerPress?.()
  };

  const setMarkerCoordinates = (coords: LatLng) => {
    setIsModalVisible(true);
    options.resetMapStrategy?.();
    editorState.changeEditorState({ ...coords });
  };

  const onSubmit = async () => {
    setCodeErrorMessage("")
    try {
      const {id, isTrashFound, message}: any = await createMarkersMutation.mutateAsync(editorState);
      setIsModalVisible(false);
      editorState.reset();
      Toast.show({
        type: isTrashFound ? 'success' : 'error',
        text1: message,
      });

      if (isTrashFound) {
        router.push({ pathname: `markers/${id}` })
      }
    } catch (error: any) {
			// KCTODO NIE MAM POMYSŁU JAK TO OBSŁUŻYĆ TYMCZASOWO ZWACAM BYLE JAKI KOD
      if (error.status === 420) {
        setCodeErrorMessage("Znacznik zbyt blisko innego znacznika! Promień graniczny: 30m")
      } else {
        console.log(JSON.parse(JSON.stringify(error)), error, "djdjd")
        Toast.show({
          type: 'error',
          text1: 'Wystąpił błąd',
        })
      }
    }
  };

  useEffect(() => {
    return () => {
      editorState.reset();
      setIsModalVisible(false);
      options.resetMapStrategy?.()
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

      {codeErrorMessage && (
        <Text className="text-red-600">{codeErrorMessage}</Text>
      )}
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
