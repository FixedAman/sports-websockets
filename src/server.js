import express from "express";
import { matchRouter } from "./routes/matches";
const app = express();
const port = 8000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.use("/", matchRouter);
app.listen(port, () => {
  console.log(`server is started at ${port}`);
});
