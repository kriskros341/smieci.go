import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Pressable, Text, View } from "react-native";
import { runOnJS } from "react-native-reanimated";
import { Image } from "expo-image";
import clsx from "clsx";

import Button from "@ui/button";
import { useCreateVerificationPhotoModal } from "@hooks/modals/useVerificationPhotoEditorModal";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { SolveMarkerEditorFormValues } from "./interfaces";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";

interface VerificationPhotoFormFieldProps {
  errors: any;
  originalPhotos: { uri: string; blurhash: string }[];
  control: Control<SolveMarkerEditorFormValues>;
  openPreviewImageModal: (uri: string) => void;
  disabled?: boolean;
}

const VerificationPhotosFormField = ({
  control,
  openPreviewImageModal,
  originalPhotos,
  errors,
  disabled,
}: VerificationPhotoFormFieldProps) => {
  const { VerificationPhotoModal, openVerificationPhotoModal } =
    useCreateVerificationPhotoModal();
  const { fields, update } = useFieldArray({
    name: "photos",
    control,
  });
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const { clearErrors } = useFormContext();

  const onUpdatePhoto = (
    activePhotoIdx: number,
    uri: string,
    openNext?: boolean,
  ) => {
    update(activePhotoIdx, { uri });
    clearErrors(`photos.${activePhotoIdx}`);
    if (!openNext) {
      return;
    }

    const nextIndex = originalPhotos
      .slice(activePhotoIdx)
      .findIndex(({ uri }) => !uri);

    if (nextIndex !== -1) {
      setActivePhotoIdx(nextIndex);
      openVerificationPhotoModal({
        newPhotoUri: fields[activePhotoIdx]?.uri,
        originalPhotoUri: originalPhotos[activePhotoIdx]?.uri,
        commit: (uri: string) => onUpdatePhoto(activePhotoIdx, uri, true),
      });
    }
  };

  const photosComponents = originalPhotos.map(({ uri, blurhash }, idx) => {
    const isOriginalPhoto = !fields[idx]?.uri;
    const dobuleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        runOnJS(openPreviewImageModal)(
          isOriginalPhoto ? uri : fields[idx].uri ?? "",
        );
      });
    return (
      <View className="relative flex basis-1/3 aspect-[0.6]">
        <Pressable
          key={`original-photo-${idx}`}
          className={clsx(
            "h-full p-1",
            !disabled && isOriginalPhoto && "opacity-60",
          )}
          onPress={() => setActivePhotoIdx(idx)}
        >
          <GestureDetector gesture={dobuleTap}>
            <Image
              className={clsx(
                "flex-1",
                !disabled &&
                  idx === activePhotoIdx &&
                  "border-4 border-green",
              )}
              key={isOriginalPhoto ? uri : fields[idx].uri}
              source={{
                uri: isOriginalPhoto ? uri : fields[idx].uri,
              }}
            />
          </GestureDetector>
        </Pressable>
        {errors?.[idx]?.message && (
          <View className="absolute right-4 top-4">
            <Tooltip delayDuration={150}>
              <TooltipTrigger>
                <MaterialIcons name="error-outline" size={24} color="red" />
              </TooltipTrigger>
              <TooltipContent className="bg-white">
                <Text className="native:text-lg">{errors?.[idx]?.message}</Text>
              </TooltipContent>
            </Tooltip>
          </View>
        )}
      </View>
    );
  });

  const buttons = [];
  if (disabled) {
  } else if (fields[activePhotoIdx]?.uri) {
    buttons.push(
      <Button
        title="Podmień"
        buttonClassName="rounded-full"
        onPress={() => {
          openVerificationPhotoModal({
            newPhotoUri: undefined,
            originalPhotoUri: originalPhotos[activePhotoIdx]?.uri,
            commit: (uri: string) => {
              onUpdatePhoto(activePhotoIdx, uri);
            },
          });
        }}
      />,
    );
  } else {
    buttons.push(
      <Button
        title="Dodaj"
        buttonClassName="rounded-full"
        onPress={() => {
          openVerificationPhotoModal({
            newPhotoUri: fields[activePhotoIdx]?.uri,
            originalPhotoUri: originalPhotos[activePhotoIdx]?.uri,
            commit: (uri: string) => onUpdatePhoto(activePhotoIdx, uri, true),
          });
        }}
      />,
    );
  }

  return (
    <>
      <View className="flex-1 flex flex-row flex-wrap h-full items-start justify-start">
        {photosComponents}
      </View>
      <View className="p-4">
        {buttons}
      </View>
      {VerificationPhotoModal}
    </>
  );
};

export default VerificationPhotosFormField;
