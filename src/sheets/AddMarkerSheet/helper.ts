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

export const useCreateMarkerMutation = () => {
  const queryClient = useQueryClient();
  const axios = useAxios();
  const createMarkersMutation = useMutation<MarkerPayload, unknown, editorStateType>({
    mutationFn: async ({ photosUris, latitude, longitude }) => {
      const payload = {
        uris: photosUris,
        latitude: latitude!,
        longitude: longitude!,
      }
      await _createMarker(
        axios,
        payload,
      )
      return payload
    },
    onMutate: async ({ photosUris, latitude, longitude }) => {
      const placeholder = {
        id: -1,
        lat: latitude,
        long: longitude,
        fileNamesString: [photosUris[0]],
        blurhashes: ['URFs0??uyCxu9DD*ozbZ-=%Moct5IVM_a#ae'],
        userId: undefined,
      }
      await queryClient.cancelQueries({ queryKey: ["/markers"] });
  
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(["/markers"],  (old: any) => [...old, placeholder]);
  
      return { previousTodos };
    },
    onError: (err, newTodo, context: any) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      // onSubmit?.();
    }
  });
  return createMarkersMutation;
}
