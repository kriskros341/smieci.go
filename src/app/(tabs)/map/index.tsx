import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import MapStrategyConsumer from "@components/mapStrategyConsumer";
import { useMapStrategy } from "@hooks/useMapStrategy";
import { AddMarkerSheet } from "@sheets/AddMarkerSheet";
import { useRouter } from "expo-router";

const Map = () => {
  const [mapStrategy, changeMapStrategy, refetch] = useMapStrategy();
  const [isAddMarkerSheetOpen, setIsAddMarkerSheetOpen] = useState(false);

  const actions = [];

  const onAddMarkerClick = () => {
    setIsAddMarkerSheetOpen(true)
  }

  if (!isAddMarkerSheetOpen) {
    actions.push((
      <Pressable className="z-10" onPressOut={onAddMarkerClick}>
        {({ pressed }) => (
          <View
            style={{ opacity: pressed ? 0.5 : 1 }}
            className="w-16 h-16 bg-white rounded-full"
          >
            <Text className="text-center">Dodaj znacznik</Text>  
          </View>
        )}
      </Pressable>
    ));
  }

  const router = useRouter();
  const onMarkerPreviewClick = (key: string) => {
    router.push(`/markers/${key}`)
  }

  return (
    <>
      <StatusBar
        animated={true}
        hidden={false}
        networkActivityIndicatorVisible={true}
        translucent={false}
      />
      <View className="relative flex flex-row flex-1">
        <MapStrategyConsumer strategy={mapStrategy} onMarkerPreviewClick={onMarkerPreviewClick} />
        <View className="absolute items-center justify-center bottom-4 right-4">
          {actions}
        </View>
      </View>
      {isAddMarkerSheetOpen && (
        <AddMarkerSheet
          hide={() => setIsAddMarkerSheetOpen(false)}
          key={isAddMarkerSheetOpen ? 'j' : 'd'}
          onMoveMarkerPress={() => changeMapStrategy("moveMarkerStrategy")}
          onMoveMarkerConfirm={() => changeMapStrategy("idle")}
          onSubmit={() => {
            setIsAddMarkerSheetOpen(false)
            console.log("onSubmit!")
            changeMapStrategy("viewMarkersStrategy")
            refetch()
          }}
        />
      )}
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
