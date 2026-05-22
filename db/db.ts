import { drizzle } from "drizzle-orm/node-postgres";
import { BotConfig } from "../src/config";
import { createClient } from "redis";

export const db = drizzle(BotConfig.env.DATABASE_URL!);
export const rdb = createClient({
  username: BotConfig.env.REDIS_USERNAME,
  password: BotConfig.env.REDIS_PASSWORD,
  socket: {
    host: BotConfig.isProduction ? BotConfig.env.REDIS_HOST : "localhost",
    port: 6379,
  },
});
