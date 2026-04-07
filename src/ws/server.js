import { WebSocket, WebSocketServer } from "ws";
import { tuple } from "zod";
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
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  // adding hearbeat mechanism
  wss.on("connection", (socket) => {
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
