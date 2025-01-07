import { useState } from "react";
import { Modal, Pressable, Text } from "react-native";

import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import Button from "@ui/button";
import { Control, useFieldArray, useForm } from "react-hook-form";
import PhotosField, { Photo } from "@components/PhotosField";
import { EditExternalMarkerPhotosFormValues } from "./useEditExternalMarkerPhotosModal.types";
import { useModifyExternalMarkerMutation } from "./useEditExternalMarkerPhotosModal.helper";
import { usePreviewImageModal } from "./usePreviewImageModal";
import DividerWithText from "@ui/DividerWithText";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@ui/checkbox";


type useEditExternalMarkerPhotosModalOptions = {
  markerKey: string,
  refetch: Function,
}

interface ExistingPhotosFormFieldProps {
  control: Control<EditExternalMarkerPhotosFormValues>
}

// KCTODO Usuwanie obecnych zdjęć?
const ExistingPhotosFormField = ({ control }: ExistingPhotosFormFieldProps) => {
  const { PreviewImageModal, openPreviewImageModal } = usePreviewImageModal();
  const { fields, update } = useFieldArray({
    name: "existingPhotos",
    control,
  });

  const toggleIsChecked = (idx: number, isChecked: boolean) => {
    update(idx, { ...fields[idx], isChecked })
  }

  return (
    <>
      <PhotosField
        photos={fields}
        openPreviewImageModal={openPreviewImageModal}
        renderControls={({ idx }) => (
          <Pressable className="absolute right-0 top-2">
            <Checkbox checked={!!fields[idx].isChecked} onCheckedChange={(value) => toggleIsChecked(idx, value)}/>
          </Pressable>
        )}
      />
      {PreviewImageModal}
    </>
  );
}

// KCTODO usuwanie dodanych zdjęć?
const NewPhotosFormField = ({ control }: ExistingPhotosFormFieldProps) => {
  const { PreviewImageModal, openPreviewImageModal } = usePreviewImageModal();
  const { fields, append } = useFieldArray({
    name: "newPhotos",
    control,
  });

  return (
    <>
      <PhotosField photos={fields} append={append} openPreviewImageModal={openPreviewImageModal} />
      {PreviewImageModal}
    </>
  );
}

// KCTODO Może warto większość zawartości przenieśc do components?
// KCTODO Limit zdjęć znacznika zewnętrznego dodawanych przez jednego użytkownika
export const useEditExternalMarkerPhotosModal = (props: useEditExternalMarkerPhotosModalOptions) => {
  const queryClient = useQueryClient()
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { handleSubmit, control, reset } = useForm<EditExternalMarkerPhotosFormValues>({
    defaultValues: {
      existingPhotos: [],
      newPhotos: [],
    },
  });

  const openEditExternalMarkerPhotosModal = (markerPhotos: Photo[]) => {
    setIsModalVisible(true);
    reset({
      existingPhotos: markerPhotos.map((photo) => ({ ...photo, isChecked: true })),
      newPhotos: [],
    });
    console.log("modal should have opened");
  };

  const mutation = useModifyExternalMarkerMutation({ markerKey: props.markerKey })

  const onSubmit = async (formState: EditExternalMarkerPhotosFormValues) => {
    await mutation.mutateAsync(formState);
    queryClient.invalidateQueries({ queryKey: [`/markers/${props.markerKey}`] });
    props.refetch();
    setIsModalVisible(false);
  };

  const EditExternalMarkerPhotosModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        console.log("close");
      }}
    >
      <ScrollView>
        <GestureHandlerRootView className="w-screen h-full">
          <DividerWithText>
            <Text>
              Obecne zdjęcia dodane przez Ciebie
            </Text>
          </DividerWithText>
          <ExistingPhotosFormField control={control} />
          <DividerWithText>
            <Text>
              Dodawanie zdjęć
            </Text>
          </DividerWithText>
          <NewPhotosFormField control={control} />
          <Pressable className="p-4">
            <Button
              title="Dodaj zdjęcia"
              disabled={mutation.isPending}
              onPress={handleSubmit(onSubmit)}
            />
          </Pressable>
        </GestureHandlerRootView>
      </ScrollView>
    </Modal>
  );

  return {
    EditExternalMarkerPhotosModal,
    openEditExternalMarkerPhotosModal,
  };
};
