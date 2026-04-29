import { WebSocket, WebSocketServer } from "ws";
import { codec, tuple } from "zod";
import { wsArcjet } from "../arcjet.js";
function sendJSON(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}
function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    client.send(JSON.stringify(payload));
  }
}

//attach of this  with actual server 8000
export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ noServer: true });
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
    sendJSON(socket, { type: "Welocome" });
    socket.on("error", console.error);

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
  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }
  return { broadcastMatchCreated };
}
