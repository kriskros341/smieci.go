import { useFormContext } from "react-hook-form";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";
import { usePreviewImageModal } from "@hooks/modals/usePreviewImageModal";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import DividerWithText from "@ui/DividerWithText";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { getUriByUploadId } from "@utils/getUriFromPhotoId";

import AdditionalPhotosFormField from "./AdditionalPhotosFormField";
import { SolveMarkerEditorFormValues } from "./interfaces";
import ParticipantsFormField from "./ParticipantsFormField";
import VerificationPhotosFormField from "./VerificationPhotosFormField";

type ResolveMarkerEditorProps = {
  markerId: string;
  disabled?: boolean;
};

function SolveMarkerEditor({ markerId, disabled }: ResolveMarkerEditorProps) {
  const { PreviewImageModal, openPreviewImageModal } = usePreviewImageModal();
  const insets = useSafeAreaInsets();
  const { data } = useMarkerQuery(markerId);
  const {
    control,
    formState: { errors },
  } = useFormContext<SolveMarkerEditorFormValues>();

  const originalPhotos: { uri: string; blurhash: string }[] = [];
  data?.fileNamesString?.forEach((_, index) => {
    originalPhotos.push({
      uri: getUriByUploadId(data?.fileNamesString[index])!,
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
          Uczestnicy{" "}
          {data?.externalObjectId ? null : (
            <Text className="text-red-800">*</Text>
          )}
        </Text>
      </DividerWithText>
      <ParticipantsFormField control={control} disabled={disabled} />
      <DividerWithText>
        <View className="flex flex-row gap-x-2">
          <Text>
            Zdjęcia ze zgłoszenia <Text className="text-red-800">*</Text>
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
        </View>
      </DividerWithText>
      <VerificationPhotosFormField
        control={control}
        errors={errors.photos}
        openPreviewImageModal={openPreviewImageModal}
        originalPhotos={originalPhotos}
        disabled={disabled}
      />
      <DividerWithText>
        <View className="flex flex-row gap-x-2">
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
        </View>
      </DividerWithText>
      <AdditionalPhotosFormField
        control={control}
        openPreviewImageModal={openPreviewImageModal}
        disabled={disabled}
      />
      {PreviewImageModal}
    </ScrollView>
  );
}

export default SolveMarkerEditor;
