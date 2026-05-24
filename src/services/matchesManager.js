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
const now = new Date();
const startTime = new Date(now.getTime() + 30000);
const endTime = new Date(now.getTime() + 8 * 60 * 1000);
const { homeTeam, awayTeam } = randomTeam();

const createMatch = async () => {
  const query = await db.select().from(matches);
  if (query.length >= 5) {
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

  const [match] = await db
    .insert(matches)
    .values(createMatchSchema.safeParse(data))
    .returning();
};

console.log(query);
