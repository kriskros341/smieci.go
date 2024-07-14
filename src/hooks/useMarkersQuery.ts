import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./use-axios";
import { _getAllMarkersCoordinates } from "../api/markers";
import { useMemo } from "react";

type MarkerCoordinates  = {
  id: string,
  lat: number,
  long: number,
}

export const useMarkersQuery = () => {
  const { isPending, error, data, refetch } = useQuery<MarkerCoordinates[]>({ queryKey: ["/markers"] });

  const result = useMemo(() => {
    const result = [];
  
    for (const entry of data ?? []) {
      result.push(
        {
          key: entry.id,
          coordinate: {
            latitude: entry.lat,
            longitude: entry.long,
          },
          pointCount: 42069,
          text: "To jest tekst powiązany ze znacznikiem"
        }
      );
    }

    return result;
  }, [data])
  return { isPending, error, data: result, refetch };
};