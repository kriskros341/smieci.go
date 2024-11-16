import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFormContext } from "react-hook-form";

import AntDesign from "@expo/vector-icons/AntDesign";
import DividerWithText from "@ui/DividerWithText";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { usePreviewImageModal } from "@hooks/modals/usePreviewImageModal";
import { getUriByUploadId } from "@utils/getUriFromPhotoId";
import { useMarkerQuery } from "@hooks/useMarkerQuery";

import VerificationPhotosFormField from "./VerificationPhotosFormField";
import AdditionalPhotosFormField from "./AdditionalPhotosFormField";
import { SolveMarkerEditorFormValues } from "./interfaces";
import ParticipantsFormField from "./ParticipantsFormField";

type ResolveMarkerEditorProps = {
  markerId: unknown;
  disabled?: boolean;
};

function SolveMarkerEditor(props: ResolveMarkerEditorProps) {
  const { PreviewImageModal, openPreviewImageModal } = usePreviewImageModal();
  const insets = useSafeAreaInsets();
  const { data } = useMarkerQuery(props.markerId);
  const {
    control,
    formState: { errors },
  } = useFormContext<SolveMarkerEditorFormValues>();

  const originalPhotos: { uri: string; blurhash: string }[] = [];
  data?.fileNamesString?.forEach((_, index) => {
    originalPhotos.push({
      uri: getUriByUploadId(data?.fileNamesString[index]),
      blurhash: data?.blurHashes[index],
    });
  });

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <ScrollView>
      <DividerWithText>
        <Text className="mr-2">
          Uczestnicy<Text className="text-red-800">*</Text>
        </Text>
      </DividerWithText>
      <ParticipantsFormField control={control} disabled={props.disabled} />
      <DividerWithText>
        <Text className="mr-2">
          Zdjęcia ze zgłoszenia<Text className="text-red-800">*</Text>
        </Text>
        <Tooltip delayDuration={150}>
          <TooltipTrigger>
            <AntDesign name="questioncircleo" size={20} color="black" />
          </TooltipTrigger>
          <TooltipContent insets={contentInsets} className="bg-white">
            <Text className="native:text-lg">
              Zdjęcia które posłużą do weryfiacji zgłoszenia. Postaraj się aby
              wiernie odwzorowywały oryginalne zdjęcia.
            </Text>
          </TooltipContent>
        </Tooltip>
      </DividerWithText>
      <VerificationPhotosFormField
        control={control}
        errors={errors.photos}
        openPreviewImageModal={openPreviewImageModal}
        originalPhotos={originalPhotos}
        disabled={props.disabled}
      />
      <DividerWithText>
        <Text className="mr-2">Dodatkowe zdjęcia</Text>
        <Tooltip delayDuration={150}>
          <TooltipTrigger>
            <AntDesign name="questioncircleo" size={20} color="black" />
          </TooltipTrigger>
          <TooltipContent insets={contentInsets} className="bg-white">
            <Text className="native:text-lg">
              Zostaną wykorzystane w przypadku problemów z automatyczną
              weryfikacją realizacji zgłoszenia.
            </Text>
          </TooltipContent>
        </Tooltip>
      </DividerWithText>
      <AdditionalPhotosFormField
        control={control}
        openPreviewImageModal={openPreviewImageModal}
        disabled={props.disabled}
      />
      {PreviewImageModal}
    </ScrollView>
  );
}

export default SolveMarkerEditor;
