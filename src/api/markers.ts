import { AxiosInstance } from "axios";
import { BaseDataResponse, BaseResponse } from "./types";

type createMarkerPayload = {
  base64Image: string,
  lat: number,
  long: number,
};

export const _createMarker = async (axios: AxiosInstance, payload: createMarkerPayload) => {
  return await axios.post("/markers", payload);
}

export const _getAllMarkersCoordinates = async (axios: AxiosInstance) => {
  return (await axios.get("/markers")).data; // ?!?!?!
}