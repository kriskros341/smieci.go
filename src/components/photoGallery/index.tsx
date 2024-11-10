import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@utils/cn";
import { DraggablePhoto } from "./draggablePhoto";

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PhotoGalleryProps {
  photos: {
    uri: string;
    blurhash: string;
  }[];
  onPhoto?: () => void;
  reorder?: (newData: any) => void;
  isDragDisabled?: boolean;
}

export const PhotoGallery = (props: PhotoGalleryProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const translateX = useSharedValue(0);
  const tempTranslateX = useSharedValue(0);
  const mainPhotoLayoutWidth = useSharedValue(0);
  const mainPhotoRef = useRef<FlatList<any>>(null);

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
    return (
      <Pressable onPress={props.onPhoto}>
        {({ pressed }) => (
          <Animated.View className="aspect-square w-full flex justify-center items-center">
            <View
              className={cn(
                "p-1 rounded-lg shadow-md shadow-black bg-blue-500",
                pressed && "opacity-50",
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
    <View>
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
            <AnimatedImage
              style={style}
              key={item.uri}
              className={cn("aspect-square h-full bg-green-100")}
              source={{ uri: item.uri }}
              placeholder={{ blurhash: item.blurhash }}
            />
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
          className={cn("h-full", props.onPhoto ? "aspect-[4]" : "aspect-[5]")}
          renderItem={(data) => (
            <DraggablePhoto {...data} isDragDisabled={props.isDragDisabled} />
          )}
        />
        <Pressable onPress={props.onPhoto}>
          {({ pressed }) => (
            <Animated.View className="aspect-square h-full flex justify-center items-center">
              <View
                className={cn(
                  "p-1 rounded-lg shadow-md shadow-black bg-blue-500",
                  pressed && "opacity-50",
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
      </View>
    </View>
  );
};

export default PhotoGallery;
