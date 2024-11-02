import { useQuery } from "@tanstack/react-query";

type MarkerResponse = {
	id: number,
  lat: number,
  long: number,
  fileNamesString: string[],
  blurhashes: string[],
  userId: string,
  points: number
}

export const useMarkerQuery = (key: unknown) => {
  const data = useQuery<MarkerResponse>({
    queryKey: [`/markers/${key}`]
  })
  return data;
}