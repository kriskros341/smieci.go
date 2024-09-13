import { AxiosInstance } from "axios";

type createMarkerPayload = {
  uris: string[],
  latitude: number,
  longitude: number,
};

export const _createMarker = async (axios: AxiosInstance, payload: createMarkerPayload) => {
  let formData = new FormData();
  payload.uris.forEach((uri) => {
    formData.append('file', {
      uri: uri,
      name: 'upload.jpg', // You can provide the file name here
      type: 'image/jpeg', // Adjust the type as needed
    } as any);
  })
  console.log(payload)
  formData.append('payload', JSON.stringify({ latitude: payload.latitude, longitude: payload.longitude }))

  try { await axios.post("/markers", formData, { headers: { "Content-Type": "multipart/form-data" }, } ); } catch (e) {
    console.warn("blad", JSON.stringify(e))
  }
}

export const _getAllMarkersCoordinates = async (axios: AxiosInstance) => {
  return (await axios.get("/markers")).data; // ?!?!?!
}