import { desc, eq, inArray, sql } from "drizzle-orm";
import db from "../db/db.js";
import { commentary, matches } from "../db/schema.js";
import { createCommentarySchema } from "../validation/commentary.js";
import { it } from "zod/locales";

// random players
const players = [
  "Alex Morgan",
  "Sam Kerr",
  "Messi",
  "Mbappe",
  "Saka",
  "Haaland",
  "Neymar",
  "Lewandowski",
];
// random commentary
const commentaryTemplates = [
  {
    eventType: "goal",

    tags: ["goal", "shot"],

    messages: [
      "GOAL! Powerful finish from the edge of the box.",
      "GOAL! Clinical strike into the bottom corner.",
      "GOAL! A stunning counter attacking finish.",
    ],
    metaData: () => ({
      assist: players[Math.floor(Math.random() * players.length)],
    }),
  },
  {
    eventType: "yellow_card",

    tags: ["card", "foul"],

    messages: [
      "Late challenge results in a yellow card.",
      "Referee shows the yellow after a rough tackle.",
    ],

    metaData: () => ({}),
  },
  {
    eventType: "corner",
    tags: ["setpiece"],

    messages: [
      "Corner kick awarded after pressure.",
      "Dangerous ball whipped into the area.",
    ],

    metaData: () => ({}),
  },
  {
    eventType: "substitution",

    tags: ["sub"],

    messages: [
      "Fresh legs coming into the game.",
      "Tactical substitution from the manager.",
    ],

    metaData: () => ({
      playerOff: players[Math.floor(Math.random() * players.length)],
    }),
  },
  {
    eventType: "free_kick",

    tags: ["setpiece"],

    messages: [
      "Free kick awarded in a dangerous position.",
      "The referee stops play for a foul.",
    ],

    metaData: () => ({}),
  },
];

// commentarystarting
export async function startCommentary(match, broadcastCommentary) {
  let matchId = match.id;
  const teams = [match.homeTeam, match.awayTeam];
  let minute = 1;
  let sequence = 1;
  // take the status
  await db
    .update(matches)
    .set({ status: "Live" })
    .where(eq(matches.id, matchId));
  async function generate() {
    try {
      // randome template
      const goalChance = Math.random() < 0.1;
      let template;
      if (goalChance) {
        template = commentaryTemplates.find((evt) => evt.eventType === "goal");
      } else {
        const nonGoalTemplates = commentaryTemplates.filter(
          (item) => item.eventType !== "goal",
        );

        template =
          nonGoalTemplates[Math.floor(Math.random() * nonGoalTemplates.length)];
      }

      // random player
      const actor = players[Math.floor(Math.random() * players.length)];
      // random team
      // match index
      const randomTeamIndex = Math.floor(Math.random() * teams.length);
      const team = teams[randomTeamIndex];

      if (template.eventType === "goal") {
        if (randomTeamIndex === 0) {
          await db
            .update(matches)
            .set({
              homeScore: sql`${matches.homeScore} + 1`,
            })
            .where(eq(matches.id, matchId));
        } else {
          await db
            .update(matches)
            .set({ awayScore: sql`${matches.awayScore} + 1` })
            .where(eq(matches.id, matchId));
        }
      }
      // update score
      const [updatedMatch] = await db
        .select()
        .from(matches)
        .where(eq(matches.id, matchId));
      // finishing match if score is 10
      if (updatedMatch.homeScore === 10 || updatedMatch.awayScore === 10) {
        await db
          .update(matches)
          .set({ status: "finished" })
          .where(eq(matches.id, matchId));
        // deleting the data
        const allfinishedMatches = await db
          .select()
          .from(matches)
          .where(eq(match.status, "finished"));
        if (allfinishedMatches.length > 0) {
          try {
            await db.delete(matches).where(eq(matches.status, "finished"));
          } catch (e) {
            console.log("something happend in allFinished matches section");
          }
        }
        broadcastCommentary(matchId, {
          type: "Match Finished",
          homeScore: updatedMatch.homeScore,
          awayScore: updatedMatch.awayScore,
        });
        return;
      }

      // random message
      const message =
        template.messages[Math.floor(Math.random() * template.messages.length)];
      // preparing the data to save in the db
      const commentaryData = {
        matchId,
        minute,
        sequence,
        period: minute <= 45 ? "1st half" : "2nd half",
        eventType: template.eventType,
        actor,
        team,
        message,
        metaData: template.metaData(),
        tags: template.tags,
      };
      const validated = createCommentarySchema.safeParse(commentaryData);
      if (!validated.success) {
        console.error(validated.error);
        return;
      }
      //inserting
      const [savedCommentary] = await db
        .insert(commentary)
        .values(validated.data)
        .returning();
      // broadCast to the user
      broadcastCommentary(matchId, {
        commentary: savedCommentary,
        score: {
          home: updatedMatch.homeScore,
          away: updatedMatch.awayScore,
        },
      });
      
      const rows = await db
        .select({ id: commentary.id })
        .from(commentary)
        .where(eq(commentary.matchId, matchId))
        .orderBy(desc(commentary.createdAt));
      console.log("rows count" ,rows.length);
      // cleanup rows
      if (rows.length > 50) {
        const rowsToDelete = rows.slice(50);
        await db.delete(commentary).where(
          inArray(
            commentary.id,
            rowsToDelete.map((row) => row.id),
          ),
        );
      }
      minute++;
      sequence++;
      // random  delay
      const delay = Math.random() * 10000 + 5000;
      // generate again
      setTimeout(generate, delay);
    } catch (error) {
      console.error("generation error:", error);
    }
  }
  generate();
}
