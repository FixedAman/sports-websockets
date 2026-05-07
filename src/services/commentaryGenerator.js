import { desc, eq, inArray } from "drizzle-orm";
import db from "../db/db";
import { commentary } from "../db/schema";

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
// team random
const teams = ["Fc Neon", "Cyber United"];
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

    metadata: () => ({}),
  },
  {
    eventType: "corner",

    tags: ["setpiece"],

    messages: [
      "Corner kick awarded after pressure.",
      "Dangerous ball whipped into the area.",
    ],

    metadata: () => ({}),
  },
  {
    eventType: "substitution",

    tags: ["sub"],

    messages: [
      "Fresh legs coming into the game.",
      "Tactical substitution from the manager.",
    ],

    metadata: () => ({
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

    metadata: () => ({}),
  },
];

// commentarystarting
async function startCommentary(matchId, broadcastCommentary) {
  let minute = 1;
  let sequence = 1;
  async function generate() {
    try {
      // randome template
      const template =
        commentaryTemplates[
          Math.floor(Math.random() * commentaryTemplates.length)
        ];
      // random player
      const actor = players[Math.floor(Math.random() * players.length)];
      // random team
      const team = teams[Math.floor(Math.random() * teams.length)];
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
      //inserting
      const [savedCommentary] = await db
        .insert(commentary)
        .values(commentaryData)
        .returning();
      // broadCast to the user
      broadcastCommentary(matchId, savedCommentary);
      const rows = await db
        .select({ id: commentary.id })
        .from(commentary)
        .where(eq(commentary.matchId, matchId))
        .orderBy(desc(commentary.createdAt));

      // cleanup rows
      if (rows.length > 100) {
        const rowsToDelete = rows.slice(100);
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
      const delay = Math.random() * 5000 + 2000;
      // generate again
      setTimeout(generate, delay);
    } catch (error) {
      console.error("generation error:", error);
    }
  }
  generate();
}
