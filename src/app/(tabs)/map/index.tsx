import { Pressable, Text, View } from "react-native";

import { _getAllMarkersCoordinates } from "../../../api/markers";
import FloatingWindowContainer from '../../components/floatingWindowContainer';
import CreateMarkerEditor from "../../components/createMarkerEditor";
import { StatusBar } from "expo-status-bar";
import { isMoveMarkerMapStrategy, isViewMarkersMapStrategy, useMapStrategy } from "./_useMapStrategy";
import MarkerPreviewModal from "../../components/markerPreviweModal";
import MapStrategyConsumer from "./_components/mapStrategyConsumer";

import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { router } from "expo-router";
import Button from "../../../ui/button";
import { usePhotoModal } from "../../photo";

const MinimalCoordinatesView = (props: any) => {
  console.log({ props })
  return (
    <View className="p-4">
      <Text>latitude</Text>
      <TextInput value={props.coordinates?.lat.toString()} editable={false} />
      <Text>longitude</Text>
      <TextInput value={props.coordinates?.long.toString()} editable={false} />
      <View className="flex flex-row">
        <Button
          title="Move marker"
          onPress={props.onConfirm}
        />
      </View>
    </View>
  )
}

const AddMarkerSheet = (props: any) => {
  const [currentBottomSheetIndex, setCurrentBottomSheetIndex] = useState(0)
  const handleSheetChanges = (index: number) => {
    console.log('handleSheetChanges', index);
    setCurrentBottomSheetIndex(index)
  };

  const onMoveMarkerPress = (currentCoordinates: any) => {
    handleSheetChanges(1);
    props.onMoveMarkerPress(currentCoordinates);
  }

  const onMoveMarkerConfirm = () => {
    props.onMoveMarkerConfirm();
    handleSheetChanges(0);
  }

  const resolveComponent = (currentBottomSheetIndex: number) => {
    if (currentBottomSheetIndex === 1) {
      return (
        <MinimalCoordinatesView coordinates={props.fakeMarkerCoordinates} onConfirm={onMoveMarkerConfirm} />
      )
    }
    return (
      <CreateMarkerEditor
        onSubmit={props.onSubmit}
        fakeMarkerCoordinates={props.fakeMarkerCoordinates}
        onMoveMarkerPress={onMoveMarkerPress}
      />

    )
  }

  console.log({ currentBottomSheetIndex })

  const isBackdrop = currentBottomSheetIndex === 0;
  return (
    <BottomSheet
      enableContentPanningGesture={false}
      index={currentBottomSheetIndex}
      onChange={handleSheetChanges}
      handleComponent={null}
      snapPoints={['100%', 200]}
      backdropComponent={(ownProps) => isBackdrop ? <Backdrop {...ownProps} hideBottomSheet={props.hide} /> : null}
    >
      <BottomSheetView className="flex items-center">
        {resolveComponent(currentBottomSheetIndex)}
       
      </BottomSheetView>
    </BottomSheet>
  )
}

// Create a memoized callback to handle the backdrop press
const Backdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    pressBehavior="close"
    onPress={() => {
      console.log("Backdrop clicked!");
      props.hideBottomSheet()
    }}
  />
);

const Map = () => {
  const [mapStrategy, changeMapStrategy, refetch] = useMapStrategy();

  const [isVisible, setIsVisible] = useState(false);

  console.log({ mapStrategy: mapStrategy.strategyName });

  const actions = [];

  const onAddMarkerClick = () => {
    setIsVisible(true)
  }

  if (isViewMarkersMapStrategy(mapStrategy) && mapStrategy.focusedMarker) {
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

  console.log({ isVisible })
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
        <MapStrategyConsumer {...mapStrategy} onMarkerPreviewClick={() => {}} />
        <View className="absolute items-center justify-center bottom-4 right-4">
          {actions}
        </View>
        {/* <FloatingWindowContainer
          visibilityState={contentSheetStrategy.contentSheetState}
          title={contentSheetStrategy.title}
          onClose={() => {
              changeMapStrategy("viewMarkersStrategy")
              contentSheetStrategy.makeHidden()
          }}
        >
          {floatingWindowContainerContent}
        </FloatingWindowContainer> */}
      </View>
      {isVisible ? (
        <AddMarkerSheet
          fakeMarkerCoordinates={isMoveMarkerMapStrategy(mapStrategy) && mapStrategy.movedMarkerCoordinates || undefined}
          isVisible={isVisible}
          onMoveMarkerPress={(movedMarkerCoordinates: any) => {
            changeMapStrategy("moveMarkerStrategy", { movedMarkerCoordinates });
          }}
          onMoveMarkerConfirm={() => {
            changeMapStrategy("viewMarkersStrategy")
          }}
          hide={() => setIsVisible(false)}
          onSubmit={() => {
            setIsVisible(false)
            changeMapStrategy("viewMarkersStrategy")
            refetch()
          }}
        />
      ) : null}
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
