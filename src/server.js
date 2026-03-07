import express from "express";
import { matchRouter } from "./routes/matches.js";
import "dotenv/config";
const app = express();
const port = 8000;
app.use(express.json());

app.use("/", matchRouter);
app.use("/matches", matchRouter);
app.listen(port, () => {
  console.log(`server is started at ${port}`);
});
