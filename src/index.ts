import { Client, GatewayIntentBits } from "discord.js";
import { BotConfig } from "./config";
import { readdirSync } from "node:fs";
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

client.login(BotConfig.env.BOT_API_KEY).catch((err) => {
  console.error(err);
});

async function load_all_events() {
  const event_dirs = readdirSync(path.join(__dirname, "events"));
  for (const event of event_dirs) {
    const e = await import(
      pathToFileURL(path.join(__dirname, "events", event)).href
    );
    if (!e.once) {
      return client.on(e.name, (...args) => e.execute(...args));
    }
    return client.once(e.name, (...args) => e.execute(...args));
  }
}
