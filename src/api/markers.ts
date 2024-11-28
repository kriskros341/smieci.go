import { AxiosInstance } from "axios";

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
  payload: { uris: string[] }
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
}

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
