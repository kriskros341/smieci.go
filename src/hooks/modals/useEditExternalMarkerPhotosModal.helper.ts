import { _modifyExternalMarkerMutation } from "@api/markers";
import { useAxios } from "@hooks/use-axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditExternalMarkerPhotosFormValues } from "./useEditExternalMarkerPhotosModal.types";
import { getUploadIdByUri } from "@utils/getUriFromPhotoId";

type useModifyExternalMarkerMutationOptions = {
  markerKey: string,
  onSettled?: Function;
};

export const useModifyExternalMarkerMutation = (
  options: useModifyExternalMarkerMutationOptions,
) => {
  const queryClient = useQueryClient();
  const axios = useAxios();
  const ModifyExternalMarkersMutation = useMutation<
    unknown,
    EditExternalMarkerPhotosFormValues,
    EditExternalMarkerPhotosFormValues
  >({
    mutationFn: async ({ existingPhotos, newPhotos }) => {
      const payload = {
        existingPhotosKeys: existingPhotos.filter(({ isChecked }) => isChecked).map(({ uri }) => getUploadIdByUri(uri)),
        newPhotos: newPhotos.map(({ uri }) => uri),
      }
      return _modifyExternalMarkerMutation(axios, options.markerKey, payload);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["/markers"] });
      options?.onSettled?.();
    },
  });
  return ModifyExternalMarkersMutation;
};
