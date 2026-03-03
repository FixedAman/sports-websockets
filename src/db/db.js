import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/singlestore";

const sql = neon(process.env.DATABASE_URL);
export default db = drizzle(sql);
