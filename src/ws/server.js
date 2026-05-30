import { WebSocket, WebSocketServer } from "ws";
import { codec, tuple } from "zod";
import { wsArcjet } from "../arcjet.js";
import { commentary } from "../db/schema.js";
import { startCommentary } from "../services/commentaryGenerator.js";

function sendJSON(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcastToAll(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    client.send(JSON.stringify(payload));
  }
}
//subscribers
const activeMatches = new Set();
const matchSubscribers = new Map();
function subscribe(matchId, socket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
}
// server loading fixed
function unsubscribe(matchId, socket) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers) return;
  subscribers.delete(socket);
  if (subscribers.size === 0) {
    return matchSubscribers.delete(matchId);
  }
}
function cleanupSubscriptions(socket) {
  for (let matchId of socket.subscriptions) {
    unsubscribe(matchId, socket);
  }
}
// only data go to the only subscriber
function broadcastToMatch(matchId, payload) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers || subscribers.size === 0) return;
  for (const client of subscribers) {
    sendJSON(client, payload);
  }
}

//attach of this  with actual server 8000
export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ noServer: true });
  //commentary function and broadcasts
  function broadcastMatchCreated(match) {
    broadcastToAll(wss, { type: "match_created", data: match });
  }
  function broadcastCommentary(matchId, comment) {
    broadcastToMatch(matchId, { type: "commentary", data: comment });
  }
  //handle message
  function handleMessage(socket, data) {
    console.log("handleMessageData", data);
    let message;
    try {
      message = JSON.parse(data.toString());
      console.log("handlemessage", message);
    } catch (error) {
      sendJSON(socket, { type: "error", message: "invalid JSON" });
      return;
    }
    if (message?.type === "subscribe" && Number.isInteger(message.matchId)) {
      subscribe(message.matchId, socket);
      socket.subscriptions.add(message.matchId);
      sendJSON(socket, { type: "subscribed", matchId: message.matchId });
    }
    if (message?.type === "unsubscribe" && Number.isInteger(message.matchId)) {
      unsubscribe(message.matchId, socket);
      socket.subscriptions.delete(message.matchId);
      sendJSON(socket, { type: "unsubscribed", matchId: message.matchId });
    }
  }
  // adding security checks
  server.on("upgrade", async (req, socket, head) => {
    if (req.url !== "/ws") {
      socket.destroy();
      return;
    }
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Time rate exceeded"
            : "Access Denied";
          socket.write(`HTTP/1.1 403 Forbidden\r\n\r\n`);
          socket.destroy();
          return;
        }
      } catch (error) {
        console.error("something went on the server!", error);
        socket.destroy();
        return;
      }
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  // adding hearbeat mechanism
  wss.on("connection", (socket, req) => {
    //creating isAlive variable
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.subscriptions = new Set();
    sendJSON(socket, { type: "Welocome" });
    socket.on("message", (data) => {
      handleMessage(socket, data);
    });
    socket.on("error", () => {
      socket.terminate();
    });
    socket.on("error", console.error);
    socket.on("close", () => {
      cleanupSubscriptions(socket);
    });
    const interval = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 3000);
    socket.on("close", () => {
      clearInterval(interval);
    });
  });

  return { broadcastMatchCreated, broadcastCommentary };
}
