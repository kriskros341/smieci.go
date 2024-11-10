import SolveMarkerEditor from "@components/editors/SolveMarkerEditor";
import { useLocalSearchParams } from "expo-router";
import { SolveMarkerEditorFormValues } from "@components/editors/SolveMarkerEditor/interfaces";
import { FormProvider, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getUriByUploadId } from "@utils/getUriFromPhotoId";
import { useEffect } from "react";

const useSolutionQuery = (solutionId: string) => {
  return useQuery<any>({
    queryKey: [`/solutions/${solutionId}`],
  });
};

const PreivewMarkerSolution = () => {
  const { solutionId, id } = useLocalSearchParams();
  const { data } = useSolutionQuery(solutionId as string);

  const methods = useForm<SolveMarkerEditorFormValues>({});
  const { reset } = methods;
  useEffect(() => {
    if (data) {
      reset({
        photos:
          data?.photos.map(({ id }: { id: string }) => ({
            uri: getUriByUploadId(id),
          })) ?? [],
        additionalPhotos: data?.additionalPhotos.map(
          ({ id }: { id: string }) => ({ uri: getUriByUploadId(id) }),
        ),
        participants: data.participants,
      });
    }
  }, [data]);

  return (
    <FormProvider {...methods}>
      <SolveMarkerEditor markerId={id} disabled />
    </FormProvider>
  );
};

export default PreivewMarkerSolution;
