import { LeaderboardEntry, LeaderboardType } from "@/interfaces";
import { AxiosInstance } from "axios";

export const _getLeaderboard = async (
  axios: AxiosInstance,
  leaderboardType: LeaderboardType,
): Promise<LeaderboardEntry[]> => {
  const response = await axios.get("/leaderboard", {
    params: {
      leaderboardType,
    },
  });
  return response.data;
};
