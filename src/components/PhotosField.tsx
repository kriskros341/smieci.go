import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import clsx from "clsx";

import AntDesign from "@expo/vector-icons/AntDesign";

export type Photo = { uri: string, blurhash?: string };

interface PhotosFieldProps {
  photos: Photo[],
  append?: (v: Photo) => void,
  openPreviewImageModal?: (uri: string) => void,
  disabled?: boolean,
  renderControls?: (props: { idx: number }) => JSX.Element
}

export const PhotosField = (props: PhotosFieldProps) => {
  const onPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      props.append?.({ uri: result.assets[0].uri });
    }
  };

  const displayFields = props.photos.map(({ uri }, idx) => {
    const dobuleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        if (props.openPreviewImageModal) {
          runOnJS(props.openPreviewImageModal)(uri!);
        }
      });

    return (
      <Pressable
        key={`original-photo-${idx}`}
        className={clsx("relative flex basis-1/3 aspect-[0.6] p-1")}
      >
        <GestureDetector gesture={dobuleTap}>
          <Image
            key={uri}
            className={clsx("flex-1")}
            source={{
              uri,
            }}
          />
        </GestureDetector>
        {props.renderControls?.({ idx }) ?? null}
      </Pressable>
    );
  });

  if (props.append && !props.disabled) {
    displayFields.push(
      <Pressable
        onPress={onPhoto}
        disabled={props.disabled}
        className="aspect-[0.6] basis-1/3 flex justify-center items-center"
      >
        {({ pressed }) => (
          <View>
            <View
              className={clsx(
                "flex justify-center items-center p-1 rounded-lg shadow-md shadow-black bg-blue-500",
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
          </View>
        )}
      </Pressable>,
    );
  }

  if (displayFields.length === 0) {
    displayFields.push(
      <View className="flex-1 h-full justify-center items-center">
        <Text>
          Brak
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 flex flex-row flex-wrap h-full items-start justify-start">
      {displayFields}
    </View>
  );
}

export default PhotosField;