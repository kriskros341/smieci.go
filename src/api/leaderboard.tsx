import { faker } from "@faker-js/faker";
import { LeaderboardEntryDTO } from "../interfaces";

export const getLeaderboard = async (): Promise<LeaderboardEntryDTO[]> => {
  const results = [];
  for (let i = 0; i < 100; i++) {
    results.push({
      username: faker.internet.userName(),
      points: faker.number.int({ min: 0, max: 1000 }),
      avatar: faker.image.dataUri(),
    });
  }
  return Promise.resolve(results.sort((a, b) => b.points - a.points));
};
