import { AxiosInstance } from "axios";
import { Region } from "react-native-maps";

type createMarkerPayload = {
  uris: string[];
  latitude: number;
  longitude: number;
};

export const _createMarker = async (
  axios: AxiosInstance,
  payload: createMarkerPayload,
): Promise<{ id: number }> => {
  const formData = new FormData();
  payload.uris.forEach((uri) => {
    formData.append("file", {
      uri,
      name: "upload.jpg", // You can provide the file name here
      type: "image/jpeg", // Adjust the type as needed
    } as any);
  });
  formData.append(
    "payload",
    JSON.stringify({
      latitude: payload.latitude,
      longitude: payload.longitude,
    }),
  );

  const res = await axios.post("/markers", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

type modifyExternalMarkerData = {
  existingPhotosKeys: string[];
  newPhotos: string[];
};

export const _modifyExternalMarkerMutation = (
  axios: AxiosInstance,
  markerKey: string,
  data: modifyExternalMarkerData,
) => {
  const formData = new FormData();
  data.newPhotos.forEach((uri) => {
    formData.append("file", {
      uri,
      name: "upload.jpg",
      type: "image/jpeg",
    } as any);
  });

  formData.append(
    "payload",
    JSON.stringify({ existingPhotosKeys: data.existingPhotosKeys }),
  );

  return axios
    .patch(`/markers/${markerKey}/uploads`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .catch((e) => console.warn("blad", JSON.stringify(e)));
};

type SupoortMarkerPayload = {
  userId: string;
  markerId: string;
  amount: number;
};

export const _supportMarker = async (
  axios: AxiosInstance,
  payload: SupoortMarkerPayload,
) => {
  return axios.put("/markers/support", payload);
};

export const _getMarkersInRegion = async (
  axios: AxiosInstance,
  region: Region,
  filterConfig?: { showResolved: boolean, showDenied: boolean },
): Promise<any[]> => {
  console.log({ filterConfig })
  const res = await axios.get("/markers/region", {
    params: {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
      showResolved: filterConfig?.showResolved ?? false,
      showDenied: filterConfig?.showDenied ?? false,
    },
  });

  return res.data;
};
