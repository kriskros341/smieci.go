import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@utils/cn";
import { DraggablePhoto } from "./draggablePhoto";
import { useContextMenu } from "@/app/markers/[id]/solution/[solutionId]";

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PhotoGalleryProps {
  photos: {
    uri: string;
    blurhash?: string;
    confidence?: number;
  }[];
  onPhoto?: () => void;
  reorder?: (newData: any) => void;
  isDragDisabled?: boolean;
  showAddPhotoButton?: boolean;
  disabled?: boolean;
  showActionsMenu?: boolean,
}


// Linear interpolation between colors
const interpolateColor = (val: number) => {

  // RGB values for our colors
  const startColor = [202, 138, 4];    // yellow-600
  const endColor = [22, 163, 74];  // green-600
  // Normalize value from [0.5, 1] to [0, 1]
  const t = (val - 0.5) * 2;
  
  // Interpolate each RGB component
  const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * t);
  const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * t);
  const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
};

export const PhotoGallery = (props: PhotoGalleryProps) => {
  const [isConfidenceHidden, setIsConfidenceHidden] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const translateX = useSharedValue(0);
  const tempTranslateX = useSharedValue(0);
  const mainPhotoLayoutWidth = useSharedValue(0);
  const mainPhotoRef = useRef<FlatList<any>>(null);

  const { Trigger, Menu } = useContextMenu({ items: [
    { text: 'Usuń', callback: () => {
      const photos = [...props.photos]
      photos.splice(focusedIndex, 1)
      props.reorder?.(photos);  
    } },
  ] });

  const onFocusChange = (index: number) => {
    translateX.value = withTiming(index * -mainPhotoLayoutWidth.value, {
      duration: 20,
    });
    setFocusedIndex(index);
  };

  const data = props.photos.map((photo, index) => ({
    ...photo,
    isFocused: index === focusedIndex,
    onFocus: () => onFocusChange(index),
  }));

  const reorder = (from: number, to: number, newData: any[]) => {
    const newFocusedIndex = newData.findIndex(
      (v) => v.uri === data[focusedIndex].uri,
    );
    setFocusedIndex(newFocusedIndex);
    translateX.value = withTiming(from * -mainPhotoLayoutWidth.value, {
      duration: 1,
    });
    props.reorder?.(newData.map((i) => i.uri));
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + tempTranslateX.value }],
  }));

  const handleLayout = useCallback((event: any) => {
    event.target?.measure((_: number, _1: number, width: number) => {
      mainPhotoLayoutWidth.value = width;
    });
  }, []);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart((event: any) => {
      tempTranslateX.value = event.translationX;
    })
    .onUpdate((event) => {
      if (focusedIndex === 0 && event.translationX > 0) {
        return;
      }
      if (focusedIndex === props.photos.length - 1 && event.translationX < 0) {
        return;
      }
      tempTranslateX.value = event.translationX;
    })
    .onEnd((event: any) => {
      let indexDelta = 0;
      if (event.translationX < -50 && focusedIndex < data.length - 1) {
        indexDelta = 1;
      } else if (event.translationX > 50 && focusedIndex > 0) {
        indexDelta = -1;
      }

      const nextIndex = focusedIndex + indexDelta;
      tempTranslateX.value = withTiming(
        indexDelta * -mainPhotoLayoutWidth.value,
        {},
        () => {
          translateX.value = nextIndex * -mainPhotoLayoutWidth.value;
          tempTranslateX.value = 0;
          runOnJS(onFocusChange)(nextIndex);
        },
      );
    });

  if (props.photos.length === 0) {
    if (!props.showAddPhotoButton) {
      return (
        <Animated.View className="flex items-center justify-center w-full aspect-square">
          <View>
            <MaterialCommunityIcons
              className="bg-none"
              name="null"
              size={64}
              color="black"
            />
            <Text className="mt-4">Brak zdjęć</Text>
          </View>
        </Animated.View>
      );
    }
    return (
      <Pressable onPress={() => props.onPhoto?.()} disabled={props.disabled}>
        {({ pressed }) => (
          <Animated.View className="flex items-center justify-center w-full aspect-square">
            <View
              className={cn(
                "p-1 rounded-lg shadow-md shadow-black bg-blue-500 aspect-square",
                pressed && "opacity-50",
                props.disabled && "opacity-50",
              )}
            >
              <AntDesign
                className="bg-none"
                name="plus"
                size={64}
                color="black"
              />
            </View>
            <Text className="mt-4">Dodaj zdjęcie</Text>
          </Animated.View>
        )}
      </Pressable>
    );
  }

  return (
    <GestureHandlerRootView className="relative">
      {props.showActionsMenu && (
        <View className="absolute top-4 right-4 w-10 h-10 bg-white z-10 rounded-full justify-center items-center">
          {Trigger}
        </View>
      )}
      <GestureDetector gesture={gesture}>
        <Animated.FlatList
          onLayout={handleLayout}
          ref={mainPhotoRef}
          data={data}
          scrollEnabled={false}
          className="w-full aspect-square"
          horizontal
          removeClippedSubviews={false}
          keyExtractor={(data, index) => data.uri + index}
          renderItem={({ item }) => (
            <View className="relative aspect-square h-full">
              <AnimatedImage
                style={style}
                key={item.uri}
                className={cn("flex-1 bg-green")}
                source={{ uri: item.uri }}
                placeholder={{ blurhash: item.blurhash }}
              />
              {item.confidence && (
              <Pressable onPressOut={() => setIsConfidenceHidden(current => !current)}>
                <Animated.View className={cn("absolute bottom-4 right-4 rounded-full px-4 py-2 bg-white flex-row items-center")} style={style}>
                  {!isConfidenceHidden && (
                    <>
                      <View className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: interpolateColor(item.confidence) }} />
                      <Text className="mr-2">
                        Pewność oceny: {Math.round(item.confidence * 100)}%
                      </Text>
                    </>
                    )}
                    {isConfidenceHidden ? <Text>{'<'}</Text> : <Text>X</Text>}
                  </Animated.View>
                </Pressable>
              )}
            </View>
          )}
        />
      </GestureDetector>
      <View className="max-w-full flex flex-row aspect-[5]">
        <DraggableFlatList
          bounces={false}
          overScrollMode="never"
          data={data}
          onDragEnd={({ from, to, data }) => reorder(from, to, data)}
          horizontal
          keyExtractor={(data, index) => data.uri + index}
          className={cn(
            "h-full",
            props.showAddPhotoButton ? "aspect-[4]" : "aspect-[5]",
          )}
          renderItem={(data) => (
            <DraggablePhoto {...data} isDragDisabled={props.isDragDisabled} />
          )}
        />
        {props.showAddPhotoButton && (
          <Pressable onPress={() => props.onPhoto?.()} disabled={props.disabled}>
            {({ pressed }) => (
              <Animated.View className="flex items-center justify-center h-full aspect-square">
                <View
                  className={cn(
                    "p-1 rounded-lg shadow-md shadow-black bg-blue-500",
                    pressed && "opacity-50",
                    props.disabled && "opacity-50",
                  )}
                >
                  <AntDesign
                    className="bg-none"
                    name="plus"
                    size={40}
                    color="black"
                  />
                </View>
              </Animated.View>
            )}
          </Pressable>
        )}
      </View>
      {Menu}
    </GestureHandlerRootView>
  );
};

export default PhotoGallery;
