import { useEffect, useState } from "react";
import { LatLng } from "react-native-maps";

import MarkerEditor from "@components/editors/MarkerEditor";
import { useCreateMarkerMutation, useEditorState } from "./helper";
import { ActivityIndicator, Modal, View } from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { Text } from "@ui/text";
import useLocation from "@hooks/useLocation";

type useAddMarkerModalOptions = {
  onMoveMarkerPress: () => void,
  resetMapStrategy: () => void,
}

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371000; // Earth's radius in meters
  const lat1 = point1.latitude * Math.PI / 180;
  const lat2 = point2.latitude * Math.PI / 180;
  const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Maximum allowed distance in meters
const MAX_DISTANCE = 2000;

export const useAddMarkerModal = (options: useAddMarkerModalOptions) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter()

  const editorState = useEditorState();
  const createMarkersMutation = useCreateMarkerMutation();
  const [codeErrorMessage, setCodeErrorMessage] = useState("")
  const { location } = useLocation();


  const onMoveMarkerPress = () => {
    setIsModalVisible(false)
    options.onMoveMarkerPress?.()
  };

  const setMarkerCoordinates = (coords: LatLng) => {
    if (!location) {
      throw new Error('User location not available');
    }

    const distance = calculateDistance(location.coords, coords);
    console.log({ distance })
    if (distance > MAX_DISTANCE) {
      Toast.show({
        type: 'error',
        text1: `Znacznik znaduje się za daleko od użytkownika.`,
        text2: `Maksymalny ${MAX_DISTANCE} m, obecny ${Math.round(distance)}m`
      });
    } else {
      setIsModalVisible(true);
  
      options.resetMapStrategy?.();
      editorState.changeEditorState({ ...coords });
    }
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
