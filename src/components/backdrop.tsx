import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

interface BackdropProps extends BottomSheetBackdropProps {
  hideBottomSheet: () => void;
}
// Create a memoized callback to handle the backdrop press
const Backdrop = (props: BackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    pressBehavior="close"
    onPress={() => {
      props.hideBottomSheet();
    }}
  />
);

export default Backdrop;
