import { Pressable, Text, View } from "react-native";

import { _getAllMarkersCoordinates } from "../../../api/markers";
import FloatingWindowContainer from '../../components/floatingWindowContainer';
import CreateMarkerEditor from "../../components/createMarkerEditor";
import { StatusBar } from "expo-status-bar";
import { isMoveMarkerMapStrategy, isViewMarkersMapStrategy, useMapStrategy } from "./_useMapStrategy";
import MarkerPreviewModal from "../../components/markerPreviweModal";
import MapStrategyConsumer from "./_components/mapStrategyConsumer";
import useContentSheetStrategy, { isContentSheetPreviewMarkerStrategy } from "./_useContentSheetStrategy";

const Map = () => {
  const [mapStrategy, changeMapStrategy, refetch] = useMapStrategy();
  const [contentSheetStrategy, changeContentSheetStrategy] = useContentSheetStrategy()

  console.log({ mapStrategy: mapStrategy.strategyName });

  const actions = [];

  const onAddMarkerClick = () => {
    contentSheetStrategy.makeFullscreen();
    changeContentSheetStrategy('createMarkerEditor')
  }

  if (isViewMarkersMapStrategy(mapStrategy) && mapStrategy.focusedMarker) {
    actions.push((
      <Pressable className="z-10" onPressOut={contentSheetStrategy.makeFullscreen}>
      {({ pressed }) => (
        <View
          style={{ opacity: pressed ? 0.5 : 1 }}
          className="flex w-16 h-16 bg-white rounded-full"
        >
          <Text className="text-center">Edytuj znacznik</Text>  
        </View>
      )}
    </Pressable>
    ));
  } else {
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

  let floatingWindowContainerContent = null;
  if (contentSheetStrategy.strategyName === 'createMarkerEditor') {
    floatingWindowContainerContent = (
      <CreateMarkerEditor
        modalVisibilityState={contentSheetStrategy.contentSheetState}
        fakeMarkerCoordinates={isMoveMarkerMapStrategy(mapStrategy) && mapStrategy.movedMarkerCoordinates || undefined}
        onSubmit={() => {
          contentSheetStrategy.makeHidden()
          changeMapStrategy("viewMarkersStrategy")
          refetch()
        }}
        onMoveMarkerPress={(movedMarkerCoordinates) => {
          changeMapStrategy("moveMarkerStrategy", { movedMarkerCoordinates });
          contentSheetStrategy.makeMinimal()
          // create temproary marker in location from argument
          // replace markers overlay with moveMarker overlay
        }}
        onMoveMarkerConfirm={() => {
          contentSheetStrategy.makeFullscreen()
          changeMapStrategy("viewMarkersStrategy")
        }}
      />
    );
  }

  if (contentSheetStrategy.strategyName === 'previewMarker') {
    floatingWindowContainerContent = (
      <MarkerPreviewModal
        markerId={isContentSheetPreviewMarkerStrategy(contentSheetStrategy) && contentSheetStrategy.previewedMarkerId || undefined}
      />
    );
  }

  const onMarkerPreviewClick = (markerKey: string) => {
    contentSheetStrategy.makePreviewMarker(markerKey)
  }

  return (
    <>
      <StatusBar
        animated={true}
        hidden={false}
        networkActivityIndicatorVisible={true}
        translucent={false}
      />
      <View className="h-8"></View>
      <View className="relative flex flex-row flex-1">
        <MapStrategyConsumer {...mapStrategy} onMarkerPreviewClick={onMarkerPreviewClick} />
        <View className="absolute items-center justify-center bottom-4 right-4">
          {actions}
        </View>
        <FloatingWindowContainer
          visibilityState={contentSheetStrategy.contentSheetState}
          title={contentSheetStrategy.title}
          onClose={() => {
              changeMapStrategy("viewMarkersStrategy")
              contentSheetStrategy.makeHidden()
          }}
        >
          {floatingWindowContainerContent}
        </FloatingWindowContainer>
      </View>
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
