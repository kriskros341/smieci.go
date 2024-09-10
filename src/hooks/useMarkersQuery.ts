import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./use-axios";
import { _getAllMarkersCoordinates } from "../api/markers";
import { useMemo } from "react";

type MarkerCoordinates  = {
  id: string,
  lat: number,
  long: number,
  mainPhotoId: number,
  mainPhotoBlurhash: string,
}

export const useMarkersQuery = () => {
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["/markers"],
    select: (markerPayload: MarkerCoordinates[]) => {
      return markerPayload?.map((marker) => ({
        key: marker.id,
        coordinate: {
          latitude: marker.lat,
          longitude: marker.long,
        },
        pointCount: 42069,
        text: "To jest tekst powiązany ze znacznikiem",
        mainPhotoId: marker.mainPhotoId,
        mainPhotoBlurhash: marker.mainPhotoBlurhash,
      })) ?? [];
    },
    initialData: [],
  });

  return { isPending, error, data, refetch };
};