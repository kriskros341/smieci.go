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
  status: 'pending' | 'approved' | 'denied';
  solvedAt?: string;
};

export const useMarkerQuery = (key: string) => {
  const data = useQuery<MarkerResponse>({
    queryKey: [`/markers/${key}`],
    refetchOnWindowFocus: true,
    enabled: !!key,
  });
  console.log(data.data)
  // KCTODO debug
  // if (data?.data?.status === 'pending') {
  //   data.data.status = 'approved'
  // }
  return data;
};
