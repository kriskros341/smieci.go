import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { _createMarker } from "@api/markers";
import { useAxios } from "@hooks/use-axios";
import useLocation from "@hooks/useLocation";

type editorStateType = 
  {
    latitude?: number;
    longitude?: number;
    photosUris: string[]
  }

const getInitialEditorState = (): editorStateType => ({
  photosUris: [],
})

export const useEditorState = () => {
  const [editorState, setEditorState] = useState<editorStateType>(getInitialEditorState());
  const { location, isPending } = useLocation();
  
  const changeEditorState = (changes: Partial<editorStateType>) => {
    setEditorState({ ...editorState, ...changes });
  };

  useEffect(() => {
    if (location && !editorState.latitude && !editorState.longitude) {
      const changes = {
        location: true,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      changeEditorState(changes);
    }
  }, [location]);

  const addPhotoUri = (newPhotoUri: string) => {
    changeEditorState({ photosUris: [...editorState.photosUris, newPhotoUri] })
  }

  const reorderPhotoUris = (photosUris: string[]) => {
    changeEditorState({ photosUris })
  }

  return { ...editorState, changeEditorState, isPending, addPhotoUri, reorderPhotoUris }
}

type MarkerPayload = {
  uris: string[],
  latitude: number,
  longitude: number,
}

type useCreateMarkerMutationOptions = {
  onSettled: Function,
}

export const useCreateMarkerMutation = (options: useCreateMarkerMutationOptions) => {
  const queryClient = useQueryClient();
  const axios = useAxios();
  const createMarkersMutation = useMutation<unknown, unknown, editorStateType>({
    mutationFn: async ({ photosUris, latitude, longitude }) => {
      const payload = {
        uris: photosUris,
        latitude: latitude!,
        longitude: longitude!,
      }
      return _createMarker(
        axios,
        payload,
      )
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['markers'] });
      options.onSettled()
      // onSubmit?.();
    }
  });
  return createMarkersMutation;
}
