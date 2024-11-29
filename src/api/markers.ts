import { AxiosInstance } from "axios";
import { Region } from "react-native-maps";

type createMarkerPayload = {
  uris: string[];
  latitude: number;
  longitude: number;
};

export const _createMarker = (
  axios: AxiosInstance,
  payload: createMarkerPayload,
) => {
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

  return axios
    .post("/markers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .catch((e) => console.warn("blad", JSON.stringify(e)));
};

export const _modifyExternalMarkerMutation = (
  axios: AxiosInstance,
  markerKey: string,
  payload: { uris: string[] },
) => {
  const formData = new FormData();
  payload.uris.forEach((uri) => {
    formData.append("file", {
      uri,
      name: "upload.jpg", // You can provide the file name here
      type: "image/jpeg", // Adjust the type as needed
    } as any);
  });

  return axios
    .patch(`/markers/${markerKey}`, formData, {
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
  axios.put("/markers/support", payload);
};

export const _getMarkersInRegion = async (
  axios: AxiosInstance,
  region: Region,
): Promise<any[]> => {
  const res = await axios.get("/markers/region", {
    params: {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    },
  });

  return res.data;
};
