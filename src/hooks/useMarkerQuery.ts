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
  externalObjectId?: number;
  status: string;
  solvedAt?: string;
};

export const useMarkerQuery = (key: string) => {
  const data = useQuery<MarkerResponse>({
    queryKey: [`/markers/${key}`],
    refetchOnWindowFocus: true,
    enabled: !!key,
  });
  return data;
};
