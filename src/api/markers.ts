import { AxiosInstance } from "axios";

type createMarkerPayload = {
  uri: string,
  lat: number,
  long: number,
};

export const _createMarker = async (axios: AxiosInstance, payload: createMarkerPayload) => {
  let formData = new FormData();
  formData.append('file', {
    uri: payload.uri,
    name: 'upload.jpg', // You can provide the file name here
    type: 'image/jpeg', // Adjust the type as needed
  } as any);
  formData.append('payload', JSON.stringify({ lat: payload.lat, long: payload.long }))

  try { await axios.post("/markers", formData, { headers: { "Content-Type": "multipart/form-data" }, } ); } catch (e) {
    console.warn("blad", JSON.stringify(e))
  }
}

export const _getAllMarkersCoordinates = async (axios: AxiosInstance) => {
  return (await axios.get("/markers")).data; // ?!?!?!
}