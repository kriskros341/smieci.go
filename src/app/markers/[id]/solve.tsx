import { useUser } from "@clerk/clerk-expo";
import SolveMarkerEditor from "@components/editors/SolveMarkerEditor";
import { SolveMarkerEditorFormValues } from "@components/editors/SolveMarkerEditor/interfaces";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useYesNoModal } from "@hooks/modals/useYesNoModal";
import { useAxios } from "@hooks/use-axios";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { isEqual } from "lodash-es";
import { useLayoutEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

const _postMarkerSolution = async (
  axios: AxiosInstance,
  markerId: string,
  payload: SolveMarkerEditorFormValues,
) => {
  const formData = new FormData();
  payload.photos.forEach(({ uri }) => {
    formData.append("primary", {
      uri,
      name: "upload.jpg", // You can provide the file name here
      type: "image/jpeg", // Adjust the type as needed
    } as any);
  });
  payload.additionalPhotos.forEach(({ uri }) => {
    formData.append("additional", {
      uri,
      name: "upload.jpg", // You can provide the file name here
      type: "image/jpeg", // Adjust the type as needed
    } as any);
  });
  formData.append(
    "payload",
    JSON.stringify({ participants: payload.participants }),
  );
  return axios
    .post(`/markers/${markerId}/solve`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(d => d.data as SolveResponse)
    .catch((e) => console.warn("blad", JSON.stringify(e, undefined, 2)));
};

type SolveResponse = { isValid: boolean, message: string }

type useSolveMarkerMutationOptions = {
  onSuccess: (data: SolveResponse) => void;
};


const useSolveMarkerMutation = (
  markerId: string,
  options: useSolveMarkerMutationOptions,
) => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (solveMarkerPayload: SolveMarkerEditorFormValues) => {
      return _postMarkerSolution(axios, markerId, solveMarkerPayload)
    },
    onSuccess: (result: SolveResponse | void) => {
      if (result) {
        options?.onSuccess?.(result);
      }
      const cache = queryClient.getQueryData(['all-markers']) as Map<string, any>;
      cache.delete(markerId);
    },
  });

  return mutation;
};

const SolveMarker = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { data: markerData } = useMarkerQuery(id as string);
  const { YesNoModal, openYesNoModal } = useYesNoModal();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const solveMarkerMutation = useSolveMarkerMutation(id as string, {
    onSuccess: ({ isValid, message }) => {
      if (isValid) {
        queryClient.refetchQueries({ queryKey: [`/markers/${id}`, "/markers"] });
        navigation.removeListener("beforeRemove", onBeforeRemove);
        navigation.goBack();
      }
      Toast.show({
        type: isValid ? "success" : "error",
        text1: message,
        text2: isValid ? "Dziękujemy!" : "Spróbuj ponownie z innymi zdjęciami",
      });
    },
  });

  const methods = useForm<SolveMarkerEditorFormValues>({
    defaultValues: {
      photos: markerData?.fileNamesString.map(() => ({ uri: undefined })) ?? [],
      additionalPhotos: [],
      participants: [{ userId: user?.id }],
    },
  });

  const {
    setError,
    handleSubmit,
    clearErrors,
    getValues,
    formState: { defaultValues },
  } = methods;

  const validate = (data: SolveMarkerEditorFormValues) => {
    let isValid = true;
    if (!markerData?.externalObjectId) {
      // Jeśli znacznik jest zewnętrzny to nie waliduj czy jest komplet zdjęć
      data.photos.forEach(({ uri }, index) => {
        if (!uri) {
          setError(`photos.${index}`, {
            type: "manual",
            message: "Pole wymagane",
          });
          isValid = false;
        }
      });
    }
    return isValid;
  };

  const onSubmit = (data: SolveMarkerEditorFormValues) => {
    // Clear previous errors
    clearErrors();

    // Run custom validation and submit if valid
    if (validate(data)) {
      solveMarkerMutation.mutate(data);
    } else {
      Toast.show({
        type: "error",
        text1: "Błąd walidacji",
        text2: "Wprowadzone dane są nieprawidłowe",
      });
    }
  };

  const onErrors = () => {
    Toast.show({
      type: "error",
      text1: "Błąd walidacji",
      text2: "Wprowadzone dane są nieprawidłowe",
    });
  };

  const onBeforeRemove = (e: any) => {
    e.preventDefault();
    if (isEqual(getValues(), defaultValues)) {
      navigation.dispatch(e.data.action);
      return;
    }

    openYesNoModal({
      onYes: () => {
        navigation.dispatch(e.data.action);
      },
      text: "Zmiany w edytorze zostaną porzucone. Czy wyjść?",
    });
  };

  useLayoutEffect(() => {
    if (solveMarkerMutation.isPending) {
      navigation.setOptions({
        headerRight: () => <ActivityIndicator />,
      });
    } else {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={handleSubmit(onSubmit, onErrors)}>
            <MaterialIcons name="done" size={24} color="green" />
          </TouchableOpacity>
        ),
      });
    }
    navigation.addListener("beforeRemove", onBeforeRemove);
    return () => {
      navigation.removeListener("beforeRemove", onBeforeRemove);
    };
  }, [navigation, onSubmit, solveMarkerMutation.isPending]);

  return (
    <FormProvider {...methods}>
      <SolveMarkerEditor markerId={id as string} />
      {YesNoModal}
    </FormProvider>
  );
};

export default SolveMarker;
