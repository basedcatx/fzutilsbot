import { Client, GatewayIntentBits } from "discord.js";
import { BotConfig } from "./config";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

await load_all_events();

client
  .login(BotConfig.env.BOT_API_KEY)
  .then(() => console.log("Initiated"))
  .catch((err) => {
    console.error(err);
  });

async function load_all_events() {
  const event_dirs = fs.readdirSync(path.join(__dirname, "events"), {
    withFileTypes: true,
  });

  for (const event of event_dirs) {
    if (!event.isFile()) continue;

    const e = (
      await import(
        pathToFileURL(path.join(__dirname, "events", event.name)).href
      )
    ).default;

    client.on(e.name, (...args) => e.execute(client, ...args));
  }
}
