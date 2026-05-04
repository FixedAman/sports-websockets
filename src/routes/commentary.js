import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";
import db from "../db/db.js";
import { commentary } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
const MAX_LIMIT = 100;
export const commentaryRoute = Router({ mergeParams: true });
// creating get data for commentary
commentaryRoute.get("/", async (req, res) => {
  const paramResult = matchIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({ message: paramResult.error.issues });
  }
  const queryResult = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({ message: queryResult.error.issues });
  }
  try {
    const { id: matchId } = paramResult.data;
    const { limit = 10 } = queryResult.data;
    const safeLimit = Math.min(limit, MAX_LIMIT);
    const result = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(safeLimit);

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("failed to fetch", error);
    res.status(500).json({ error: "failed connect" });
  }
});
//creating post data
commentaryRoute.post("/", async (req, res) => {
  const paramResult = matchIdParamSchema.safeParse(req.params);

  console.log(req.params);
  if (!paramResult.success) {
    return res
      .status(400)
      .json({ error: "invalid match Id", details: paramResult.error.issues });
  }
  const bodyResult = createCommentarySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res
      .status(400)
      .json({ error: "invalid body data", details: bodyResult.error.issues });
  }
  try {
    const { minute, ...rest } = bodyResult.data;
    const [result] = await db
      .insert(commentary)
      .values({
        matchId: paramResult.data.id,
        minute,
        ...rest,
      })
      .returning();
    if (res.app.locals.broadcastCommentary) {
      res.app.locals.broadcastCommentary(result.matchId, result);
    }
    res.status(201).json({ data: result });
  } catch (error) {
    console.error("failed to create commentary", error);
    res.status(500).json({ error: "failed to create commentary!" });
  }
});
