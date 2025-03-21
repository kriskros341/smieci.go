import { StatusBar } from "expo-status-bar";
import { Pressable, View } from "react-native";

import MapStrategyConsumer from "@components/mapStrategyConsumer";
import { useMapStrategy } from "@hooks/useMapStrategy";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { isMoveMarkerMapStrategy, isViewMarkersMapStrategy } from "@utils/hasCoords";
import { useAddMarkerModal } from "@hooks/modals/useAddMarkerModal";
import { useMapFocusPoint } from "@stores/useMapFocusPoint";
import { useContextMenu } from "@/app/markers/[id]/solution/[solutionId]";
import { useState } from "react";
import { useInstructionModal } from "@hooks/modals/useInstructionModal";

const Map = () => {
  const [strategy, changeMapStrategy] = useMapStrategy();
  const { AddMarkerModal, setMarkerCoordinates, setIsModalVisible } = useAddMarkerModal({
    onMoveMarkerPress: () => {
      changeMapStrategy("moveMarkerStrategy")
    },
    resetMapStrategy: () => {
      changeMapStrategy("viewMarkersStrategy")
    }
  });

  const { InstructionModal, setIsModalVisible: setIsModalVisible2 } = useInstructionModal()
  const { mapFocusPoint } = useMapFocusPoint();

  const actions = [];

  const onAddMarkerClick = () => {
    setIsModalVisible(true);
  };

  const confirmMoveMarkerToMapFocusPoint = () => {
    setMarkerCoordinates(mapFocusPoint!)
  }

  // const queryClient = useQueryClient();

  // const refreshMarkers = () => {
  //   const cache = queryClient.getQueryData(['all-markers']) as any;
  //   console.log({ cache })
  //   queryClient.resetQueries()
  //   cache?.clear()
  // }

  // actions.push(
  //   <Pressable className="z-10 right-12" onPressOut={refreshMarkers}>
  //     {({ pressed }) => (
  //       <View
  //         style={{ opacity: pressed ? 0.5 : 1 }}
  //         className="w-16 h-16 bg-white rounded-full justify-center items-center"
  //       >
  //         <MaterialIcons
  //           name="refresh"
  //           color="green"
  //           size={40}
  //         />
  //         </View>
  //     )}
  //   </Pressable>,
  // )

  const [filterConfig, setFilterConfig] = useState({
    showResolved: false,
    showDenied: false,
  })

  const { Trigger, Menu } = useContextMenu({
    items: [
      {
        text: filterConfig.showResolved ? "Ukryj rozwiązane" : "Pokaż rozwiązane",
        callback: () => setFilterConfig(curr => ({...curr, showResolved: !filterConfig.showResolved}))
      },
      {
        text: filterConfig.showDenied ? "Ukryj odrzucone" : "Pokaż odrzucone",
        callback: () => setFilterConfig(curr => ({...curr, showDenied: !filterConfig.showDenied}))
      }
    ],
    customIconResolver: (onLayout) => (
      <MaterialCommunityIcons
        name="filter"
        color="green"
        size={40}
        onLayout={onLayout}
      />
    )
  })

  if (isViewMarkersMapStrategy(strategy)) {
    actions.push(
      <Pressable className="z-10 right-12" onPressOut={() => setIsModalVisible2(true)} key="xd">
        {({ pressed }) => (
          <View
            style={{ opacity: pressed ? 0.5 : 1 }}
            className="w-16 h-16 bg-white rounded-full justify-center items-center"
          >
            <MaterialIcons name="question-mark" size={24} color="green"/>
          </View>
        )}
      </Pressable>,
      <View
        key="kk"
        className="z-10 right-12 w-16 h-16 bg-white rounded-full justify-center items-center"
      >
        {Trigger}
      </View>,
      <Pressable className="z-10 right-12" onPressOut={onAddMarkerClick} key="dc">
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
      <Pressable className="z-10 right-12" onPressOut={confirmMoveMarkerToMapFocusPoint} key="mv">
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
          filterConfig={filterConfig}
        />
        <View className="absolute items-center justify-center flex-col gap-4 bottom-4 right-4">
          {actions}
        </View>
      </View>
      {Menu}
      {InstructionModal}
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
