export interface LeaderboardEntryDTO {
  username: string;
  points: number;
}

export interface Auth {
  username: string;
  emailAddress: string;
  password: string;
  onChange: (key: Exclude<keyof Auth, "onChange">, value: string) => void;
}
