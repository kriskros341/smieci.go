export interface Auth {
  username: string;
  emailAddress: string;
  password: string;
  onChange: (key: Exclude<keyof Auth, "onChange">, value: string) => void;
}

export type LeaderboardEntry = {
  userId: string;
  username: string;
  numberOfPoints: number;
  imageUrl: string;
};

export const leaderboardTypes = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;

export type LeaderboardType =
  (typeof leaderboardTypes)[keyof typeof leaderboardTypes];
