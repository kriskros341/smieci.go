import { Pressable, Text, View } from "react-native";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import clsx from "clsx";

import AntDesign from "@expo/vector-icons/AntDesign";

import { SolveMarkerEditorFormValues } from "./interfaces";
// KCTODO nie ustawiają się zdjęcia? RESET
const AdditionalPhotosFormField = ({
  control,
  openPreviewImageModal,
  disabled,
}: {
  control: Control<SolveMarkerEditorFormValues>;
  openPreviewImageModal: (uri: string) => void;
  disabled?: boolean,
}) => {
  const { fields, append } = useFieldArray({
    name: "additionalPhotos",
    control,
  });

  const onPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      append({ uri: result.assets[0].uri });
    }
  };

  const displayFields = fields.map(({ uri }, idx) => {
    const dobuleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        runOnJS(openPreviewImageModal)(uri!);
      });

    return (
      <Pressable
        key={`original-photo-${idx}`}
        className={clsx("flex basis-1/3 aspect-[0.6] p-1")}
      >
        <GestureDetector gesture={dobuleTap}>
          <Image
            className={clsx("flex-1")}
            source={{
              uri,
            }}
          />
        </GestureDetector>
      </Pressable>
    );
  });

  displayFields.push(
    <Pressable
      onPress={onPhoto}
      disabled={disabled}
      className="aspect-[0.6] basis-1/3 flex justify-center items-center"
    >
      {({ pressed }) => (
        <View>
          <View
            className={clsx(
              "flex justify-center items-center p-1 rounded-lg shadow-md shadow-black bg-blue-500",
              pressed && "opacity-50"
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
    </Pressable>
  );

  return (
    <View className="flex-1 flex flex-row flex-wrap h-full items-start justify-start">
      {displayFields}
    </View>
  );
};

export default AdditionalPhotosFormField;
