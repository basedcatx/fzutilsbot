import { drizzle } from "drizzle-orm/node-postgres";
import { BotConfig } from "../src/config";

export const db = drizzle(BotConfig.env.DATABASE_URL!);
