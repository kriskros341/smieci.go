import { Image } from "expo-image";
import { ScaleDecorator } from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native-gesture-handler";

import { cn } from "@utils/cn";

export const DraggablePhoto = ({ item, drag, isActive }: any) => {
  return (
    <ScaleDecorator>
      <TouchableOpacity
        onPress={item.onFocus}
        onLongPress={drag}
        disabled={isActive}
      >
        <Image
          className={cn("aspect-square h-full bg-green-100", item.isFocused && "border-yellow-500 border-4")}
          source={{ uri: item.uri }}
          placeholder={{ blurhash: item.blurhash }} />
      </TouchableOpacity>
    </ScaleDecorator>
  );
};
