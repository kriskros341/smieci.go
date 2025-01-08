import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { _createMarker } from "@api/markers";
import { useAxios } from "@hooks/use-axios";
import useLocation from "@hooks/useLocation";

export type editorStateType = {
  latitude?: number;
  longitude?: number;
  photosUris: string[];
};

const initial = {
  photosUris: [] as string[],
};

export const useEditorState = () => {
  const [editorState, setEditorState] = useState<editorStateType>(initial);

  const { location, isPending } = useLocation();

  const changeEditorState = (changes: Partial<editorStateType>) => {
    setEditorState({ ...editorState, ...changes });
  };

  const reset = () => {
    let changes = {};
    if (location) {
      changes = {
        location: true,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      };
    }
    changeEditorState({ ...initial, ...changes });
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
    changeEditorState({ photosUris: [...editorState.photosUris, newPhotoUri] });
  };

  const reorderPhotoUris = (photosUris: string[]) => {
    changeEditorState({ photosUris });
  };

  return {
    ...editorState,
    changeEditorState,
    isPending,
    addPhotoUri,
    reorderPhotoUris,
    reset,
  };
};

type MarkerPayload = {
  photosUris: string[];
  latitude: number;
  longitude: number;
};

export const useCreateMarkerMutation = () => {
  const queryClient = useQueryClient();
  const axios = useAxios();
  const createMarkersMutation = useMutation<
    unknown,
    MarkerPayload,
    editorStateType
  >({
    mutationFn: async ({ photosUris, latitude, longitude }) => {
      const payload = {
        uris: photosUris,
        latitude: latitude!,
        longitude: longitude!,
      };
      const result = await _createMarker(axios, payload);
      return result;
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["/markers"] });
    },
    onError(err) {
      console.log("blad:", JSON.stringify(err));
    },
  });
  return createMarkersMutation;
};
