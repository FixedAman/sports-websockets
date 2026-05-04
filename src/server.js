import express from "express";
import { matchRouter } from "./routes/matches.js";
import "dotenv/config";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { commentaryRoute } from "./routes/commentary.js";
const app = express();
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

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
const { broadcastMatchCreated, broadcastCommentary } =
  attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`Websocket is running  on ${baseUrl.replace("http", "ws")}/ws`);
});
