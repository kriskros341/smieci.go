import { useQuery } from "@tanstack/react-query";

type MarkerResponse = {
  id: number;
  lat: number;
  long: number;
  fileNamesString: string[];
  userId: string;
  points: number;
  blurHashes: string[];
  pendingVerificationsCount: number;
  latestSolutionId: number;
  externalObjectId?: number
};

export const useMarkerQuery = (key: unknown) => {
  const data = useQuery<MarkerResponse>({
    queryKey: [`/markers/${key}`],
    refetchOnWindowFocus: true,
  });
  return data;
};
