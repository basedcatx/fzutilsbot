import { configDotenv } from "dotenv";
import path from "node:path";

configDotenv({ path: path.join(import.meta.dirname, "..", ".env") });

function validateEnv(key: string) {
  const res = process.env[key];
  if (!res) {
    console.error(`Invalid Env for: ${key}`);
  }
  return res!;
}

export const BotConfig = {
  env: {
    BOT_API_KEY: validateEnv("BOT_API_TOKEN"),
    BOT_ID: validateEnv("BOT_ID"),
    REDIS_USERNAME: validateEnv("REDIS_USERNAME"),
    REDIS_PASSWORD: validateEnv("REDIS_PASSWORD"),
    REDIS_HOST: validateEnv("REDIS_HOST"),
    DATABASE_URL: `postgres://${validateEnv("POSTGRES_USER")}:${validateEnv("POSTGRES_PASSWORD")}@localhost:5432/fzdb`,
  },
  guild: {
    PROD_SERVER_ID: validateEnv("PROD_SERVER_ID"),
    SUPPORT_SERVER_ID: validateEnv("SUPPORT_SERVER_ID"),
  },
  isProduction: process.env.PRODUCTION,
};
