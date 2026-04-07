import { WebSocket, WebSocketServer } from "ws";
function sendJSON(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}
function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) return;
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

  wss.on("connection", (socket) => {
    sendJSON(socket, { type: "Welocome" });
    socket.on("error", console.error);
    socket.on("message", (msg) => {
      console.log("received message: ", msg.toString());
    });
    socket.on("close", (code, reason) => {
      console.log(`closing message : ${code}: `, reason.toString());
    });
  });
  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }
  return { broadcastMatchCreated };
}
