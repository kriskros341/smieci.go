import { useQuery } from "@tanstack/react-query";

type MarkerResponse = {
  id: number;
  lat: number;
  long: number;
  fileNamesString: string[];
  userId: string;
  points: number;
  blurHashes: string[];
  pendingVerificationsCount: number,
  latestSolutionId: number
};

export const useMarkerQuery = (key: unknown) => {
  const data = useQuery<MarkerResponse>({
    queryKey: [`/markers/${key}`],
  });
  return data;
};
