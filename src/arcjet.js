import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjectKey = process.env.ARCJET_KEY;
const arcjectMode = process.env.ARCJET_ENV === "DRY_RUN" ? "DRY_RUN" : "LIVE";
if (!arcjectKey) throw new Error("ARCJET_KEY is missing in env files!");

export const httpArcjet = arcjectKey
  ? arcjet({
      key: arcjectKey,
      rules: [
        shield({ mode: arcjectMode }),
        detectBot({
          mode: arcjectMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjectMode, interval: "10s", max: 50 }),
      ],
    })
  : null;
export const wsArcjet = arcjectKey
  ? arcjet({
      key: arcjectKey,
      rules: [
        shield({ mode: arcjectMode }),
        detectBot({
          mode: arcjectMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjectMode, interval: "2s", max: 5 }),
      ],
    })
  : null;
export function securityMiddleware() {
  return async (req, res, next) => {
    if (!httpArcjet) return next();
    try {
      let decision = await httpArcjet.protect(req);
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ message: "server req limit reached!" });
        }
        return res.status(403).json({ message: "forbidden!" });
      }
    } catch (e) {
      return res.status(503).json({ message: "server issues" });
      console.error("look for the error ", e);
    }
    next();
  };
}
