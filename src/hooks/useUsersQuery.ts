import { useQuery } from "@tanstack/react-query"

export const useUsers = () => {
  return useQuery({
    queryKey: ['/users/getUsers'],
    select: (data: any) => data.data,
  })
}