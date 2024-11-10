import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { LatLng } from "react-native-maps";

import Backdrop from "@components/backdrop";
import CreateMarkerEditor from "@components/editors/MarkerEditor";
import MinimalCoordinatesView from "@components/minimalCoordinatesView";
import { useMapFocusPoint } from "@stores/useMapFocusPoint";
import { useCreateMarkerMutation, useEditorState } from "./helper";

const SHEET_STATES = {
  EDITOR: 0,
  MOVE_MARKER: 1,
} as const;

interface AddMarkerSheetProps {
  hide: () => void;
  onMoveMarkerPress: () => void;
  onMoveMarkerConfirm: () => void;
  onSubmit: () => void;
}

export const AddMarkerSheet = (props: AddMarkerSheetProps) => {
  const editorState = useEditorState();
  const createMarkersMutation = useCreateMarkerMutation({
    onSettled: props.onSubmit,
  });

  const { mapFocusPoint, changeMapFocusPoint } = useMapFocusPoint();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [currentBottomSheetIndex, setCurrentBottomSheetIndex] = useState(0);

  const onMoveMarkerPress = (currentCoordinates: LatLng) => {
    changeMapFocusPoint(currentCoordinates);
    setCurrentBottomSheetIndex(SHEET_STATES.MOVE_MARKER);
    props.onMoveMarkerPress();
  };

  const onMoveMarkerConfirm = () => {
    editorState.changeEditorState({ ...mapFocusPoint });
    setCurrentBottomSheetIndex(SHEET_STATES.EDITOR);
    props.onMoveMarkerConfirm();
  };

  const isBackdrop = currentBottomSheetIndex === SHEET_STATES.EDITOR;

  const onSubmit = () => {
    createMarkersMutation.mutate(editorState);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={currentBottomSheetIndex}
      enableContentPanningGesture={false}
      handleComponent={null}
      onChange={setCurrentBottomSheetIndex}
      snapPoints={["100%", 200]}
      backdropComponent={(ownProps: any) =>
        isBackdrop ? (
          <Backdrop {...ownProps} hideBottomSheet={props.hide} />
        ) : null
      }
    >
      <BottomSheetView className="flex items-center">
        {currentBottomSheetIndex === SHEET_STATES.MOVE_MARKER ? (
          <MinimalCoordinatesView
            coordinates={mapFocusPoint}
            onConfirm={onMoveMarkerConfirm}
          />
        ) : (
          <CreateMarkerEditor
            editorState={editorState}
            onSubmit={onSubmit}
            moveMarker={onMoveMarkerPress}
            isPending={createMarkersMutation.isPending}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};
