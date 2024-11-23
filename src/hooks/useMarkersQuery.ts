import { useQuery } from "@tanstack/react-query";

type MarkerCoordinates = {
  id: string;
  lat: number;
  long: number;
  mainPhotoId: number;
  mainPhotoBlurhash: string;
  placeholder: boolean;
  verificationStatus?: string;
  externalObjectId?: number,
};

export const useMarkersQuery = () => {
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["/markers"],
    select: (markerPayload: MarkerCoordinates[]) => {
      return (
        markerPayload?.map((marker) => ({
          key: marker.id,
          coordinate: {
            latitude: marker.lat,
            longitude: marker.long,
          },
          pointCount: 42069,
          text: "To jest tekst powiązany ze znacznikiem",
          mainPhotoId: marker.mainPhotoId,
          mainPhotoBlurhash: marker.mainPhotoBlurhash,
          placeholder: marker.id === "-1",
          verificationStatus: marker.verificationStatus,
          externalObjectId: marker.externalObjectId
        })) ?? []
      );
    },
    initialData: [],
  });

  return { isPending, error, data, refetch };
};
