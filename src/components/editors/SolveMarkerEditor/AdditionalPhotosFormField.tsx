import { Control, useFieldArray } from "react-hook-form";
import PhotosField from "@components/PhotosField";
import { SolveMarkerEditorFormValues } from "./interfaces";

const AdditionalPhotosFormField = ({
  control,
  openPreviewImageModal,
  disabled,
}: {
  control: Control<SolveMarkerEditorFormValues>;
  openPreviewImageModal?: (uri: string) => void;
  disabled?: boolean;
}) => {
  const { fields, append } = useFieldArray({
    name: "additionalPhotos",
    control,
  });

  return (
    <PhotosField
      photos={fields}
      append={append}
      disabled={disabled}
      openPreviewImageModal={openPreviewImageModal}
    />
  );
};

export default AdditionalPhotosFormField;
