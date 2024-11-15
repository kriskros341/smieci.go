import { useQuery } from "@tanstack/react-query";

type Users = {
  id: string;
  username: string;
  profileImageURL: string;
  points: number;
};

export const useUsers = () => {
  return useQuery<Users[]>({
    queryKey: ["/users/getUsers"],
    select: (data: any) => data.data,
  });
};
