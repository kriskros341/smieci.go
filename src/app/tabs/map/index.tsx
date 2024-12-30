import { StatusBar } from "expo-status-bar";
import { Pressable, View } from "react-native";

import MapStrategyConsumer from "@components/mapStrategyConsumer";
import { useMapStrategy } from "@hooks/useMapStrategy";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { isMoveMarkerMapStrategy, isViewMarkersMapStrategy } from "@utils/hasCoords";
import { useAddMarkerModal } from "@hooks/modals/useAddMarkerModal";
import { useMapFocusPoint } from "@stores/useMapFocusPoint";

const Map = () => {
  const [strategy, changeMapStrategy] = useMapStrategy();
  const { AddMarkerModal, setMarkerCoordinates, setIsModalVisible } = useAddMarkerModal({
    onMoveMarkerPress: () => {
      changeMapStrategy("moveMarkerStrategy")
    },
    onCancel: () => {
      changeMapStrategy("viewMarkersStrategy")
    }
  })
  const { mapFocusPoint } = useMapFocusPoint();

  const actions = [];

  const onAddMarkerClick = () => {
    setIsModalVisible(true);
  };

  const confirmMoveMarkerToMapFocusPoint = () => {
    setMarkerCoordinates(mapFocusPoint!)
  }

  if (isViewMarkersMapStrategy(strategy)) {
    actions.push(
      <Pressable className="z-10 right-12" onPressOut={onAddMarkerClick}>
        {({ pressed }) => (
          <View
            style={{ opacity: pressed ? 0.5 : 1 }}
            className="w-16 h-16 bg-white rounded-full justify-center items-center"
          >
            <MaterialCommunityIcons
              name="plus"
              color="green"
              size={40}
            />
            </View>
        )}
      </Pressable>,
    );
  } else if (isMoveMarkerMapStrategy(strategy)) {
    actions.push(
      <Pressable className="z-10 right-12" onPressOut={confirmMoveMarkerToMapFocusPoint}>
        {({ pressed }) => (
          <View
            style={{ opacity: pressed ? 0.5 : 1 }}
            className="w-16 h-16 bg-white rounded-full justify-center items-center"
          >
            <MaterialIcons
              name="place"
              color="green"
              size={40}
            />
            </View>
        )}
      </Pressable>,
    );
  }

  const router = useRouter();
  const onMarkerPreviewClick = (key: number) => {
    router.push(`/markers/${key}`);
  };

  return (
    <>
      <StatusBar
        animated={true}
        hidden={false}
        networkActivityIndicatorVisible={true}
        translucent={false}
      />
      <View className="relative flex flex-row flex-1">
        <MapStrategyConsumer
          strategy={strategy}
          onMarkerPreviewClick={onMarkerPreviewClick}
        />
        <View className="absolute items-center justify-center bottom-4 right-4">
          {actions}
        </View>
      </View>
      {AddMarkerModal}
    </>
  );
};

export default Map;

/* Map handler idea:

MapHander
  
  Details story
    Once user selected a marker, display callout with quick description and a button that opens bottom sheet.
    Bottom sheet starts in maximized state and contains MarkerPreviewContent.
      Add new state to Bottom sheet - "half".
        Should it alter the layout? Yes
      Add new state to Bottom sheet - "minimal". make it current minimized behavior. (Special state for moveMarkerPreview)
        Should it alter the layout? No
      Change "minimized" state to be actually minimized - Only the window header
        Should it alter the layout? Yes
      Make minimized bottom sheet take half of the screen and make it part of map container layout (Not absolute)

  new name: ContentSheet?
*/
