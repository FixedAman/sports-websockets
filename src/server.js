import AgentAPI from "apminsight";
AgentAPI.config();

import express from "express";
import { matchRouter } from "./routes/matches.js";
import "dotenv/config";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { commentaryRoute } from "./routes/commentary.js";
import db from "./db/db.js";
import { matches } from "./db/schema.js";
import { startCommentary } from "./services/commentaryGenerator.js";
import { createMatch } from "./services/matchesManager.js";
import cors from "cors";
import { eq } from "drizzle-orm";
const app = express();
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
const server = http.createServer(app);
app.use((req, res, next) => {
  console.log("hit", req.method, req.url);
  next();
});
app.use(securityMiddleware());
app.use("/", matchRouter);
app.use("/matches", matchRouter);
app.use("/matches/:id/commentary", commentaryRoute);
const {
  broadcastMatchCreated,
  broadcastCommentary,
  broadcastAllMatchScoreUpdate,
  broadcastFinishedMatches,
} = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;
app.locals.broadcastAllMatchScoreUpdate = broadcastAllMatchScoreUpdate;
app.locals.broadcastFinishedMatches = broadcastFinishedMatches;
server.listen(PORT, HOST, async () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`Websocket is running  on ${baseUrl.replace("http", "ws")}/ws`);

  const allMatches = await db.select().from(matches);
  if (allMatches) {
    for (let match of allMatches) {
      startCommentary(
        match,
        broadcastCommentary,
        broadcastAllMatchScoreUpdate,
        broadcastFinishedMatches,
      );
    }
  }
  setInterval(async () => {
    const scheduledMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.status, "scheduled"));
    for (let match of scheduledMatches) {
      startCommentary(
        match,
        broadcastCommentary,
        broadcastAllMatchScoreUpdate,
        broadcastFinishedMatches,
      );
    }
  await  createMatch(broadcastMatchCreated);
  }, 60000);
});
