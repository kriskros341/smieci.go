import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { Text, View } from "react-native"

import Button from "@ui/button"

const MinimalCoordinatesView = (props: any) => {
  return (
    <View className="p-4">
      <Text>latitude</Text>
      <BottomSheetTextInput value={props.coordinates?.latitude.toString()} editable={false} />
      <Text>longitude</Text>
      <BottomSheetTextInput value={props.coordinates?.longitude.toString()} editable={false} />
      <View className="flex flex-row">
        <Button
          title="Move marker"
          onPress={props.onConfirm}
        />
      </View>
    </View>
  )
}

export default MinimalCoordinatesView;