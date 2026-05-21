import { defineConfig } from "drizzle-kit";
import { BotConfig } from "./src/config";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: BotConfig.env.DATABASE_URL!,
  },
});
