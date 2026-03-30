import { configDotenv } from "dotenv";
import path from "node:path";

configDotenv({ path: path.join(__dirname, "..", ".env") });

export const BotConfig = {
  env: {
    BOT_API_KEY: process.env.BOT_API_TOKEN!,
  },
  guild: {
    PROD_SERVER_ID: process.env.PROD_SERVER_ID!,
  },
};
