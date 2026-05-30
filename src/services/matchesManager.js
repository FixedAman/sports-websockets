import { count, eq } from "drizzle-orm";
import db from "../db/db.js";
import { matches } from "../db/schema.js";
import { createMatchSchema } from "../validation/matches.js";

const footballTeams = [
  "Manchester City",
  "Arsenal",
  "Liverpool",
  "Chelsea",
  "Barcelona",
  "Real Madrid",
  "Bayern Munich",
  "PSG",
  "Juventus",
  "AC Milan",
];
function randomTeam() {
  const shuffled = [...footballTeams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    homeTeam: shuffled[0],
    awayTeam: shuffled[1],
  };
}

export const createMatch = async () => {
  const { homeTeam, awayTeam } = randomTeam();

  let startTime = new Date(Date.now());
  let endTime = new Date(Date.now() + 8 * 60 * 1000);

  // deleting finished matches !!
  const finishedMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.status, "finished"));
  if (finishedMatches.length > 0) {
    await db.delete(matches).where(eq(matches.id, finishedMatches.id));
  }

  const allMatches = await db.select().from(matches);
  if (allMatches.length >= 5) {
    return;
  }

  const data = {
    sport: "football",
    homeTeam,
    awayTeam,
    status: "scheduled",
    startTime,
    endTime,
    homeScore: 0,
    awayScore: 0,
  };
  const validated = createMatchSchema.safeParse(data);
  if (!validated.success) {
    console.error(validated.error);
    return;
  }
  await db.insert(matches).values(validated.data).returning();
};
