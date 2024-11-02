import SolveMarkerEditor from "@components/editors/SolveMarkerEditor";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from "react-native-gesture-handler";
import { SolveMarkerEditorFormValues } from "@components/editors/SolveMarkerEditor/interfaces";
import { FormProvider, useForm } from "react-hook-form";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import { useYesNoModal } from "@hooks/modals/useYesNoModal";
import { isEqual } from "lodash-es";
import Toast from "react-native-toast-message";


const SolveMarker = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { data } = useMarkerQuery(id);
  const { YesNoModal, openYesNoModal } = useYesNoModal();

  const methods = useForm<SolveMarkerEditorFormValues>({
    defaultValues: {
      photos: data?.fileNamesString.map(() => ({ uri: undefined })) ?? [],
      additionalPhotos: [],
    },
  });

  const { setError, handleSubmit, clearErrors, getValues, formState: { defaultValues } } = methods;

  const validate = (data: SolveMarkerEditorFormValues) => {
    let isValid = true;
    data.photos.forEach(({ uri }, index) => {
      if (!uri) {
        setError(`photos.${index}`, { type: 'manual', message: 'Pole wymagane' });
        isValid = false;
      }
    });
    return isValid;
  };

  const onSubmit = (data: SolveMarkerEditorFormValues) => {
    console.log('Submitted data:', data);
    // Clear previous errors
    clearErrors();

    // Run custom validation and submit if valid
    if (validate(data)) {
    } else {
      Toast.show({
        type: 'error',
        text1: 'Błąd walidacji',
        text2: 'Wprowadzone dane są nieprawidłowe'
      })
    }
  };

  const onErrors = () => {
    Toast.show({
      type: 'error',
      text1: 'Błąd walidacji',
      text2: 'Wprowadzone dane są nieprawidłowe'
    })
  }

  const onBeforeRemove = (e: any) => {
    e.preventDefault();
    console.log('onback');
    if(isEqual(getValues(), defaultValues)) {
      navigation.dispatch(e.data.action);
      return;
    }

    openYesNoModal({
      onYes: () => {
        navigation.dispatch(e.data.action);
      },
      text: 'Zmiany w edytorze zostaną porzucone. Czy wyjść?',
    });
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSubmit(onSubmit, onErrors)}>
          <MaterialIcons name="done" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
    navigation.addListener('beforeRemove', onBeforeRemove);
    return () => {
      navigation.removeListener('beforeRemove', onBeforeRemove);
    }
  }, [navigation, onSubmit]);

  return (
    <FormProvider {...methods}>
      <SolveMarkerEditor markerId={id} />
      {YesNoModal}
    </FormProvider>
  )
}

export default SolveMarker;