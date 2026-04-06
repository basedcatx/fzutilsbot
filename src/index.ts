import { Client, Collection, GatewayIntentBits } from "discord.js";
import { BotConfig } from "./config";
import fs from "node:fs";
import path, { extname } from "node:path";
import { pathToFileURL } from "node:url";
import type { ClientWithCollection, SlashCommandType } from "./types";
import { createClient } from "redis";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

export const redisClient = createClient({
  username: BotConfig.env.REDIS_USERNAME,
  password: BotConfig.env.REDIS_PASSWORD,
  socket: {
    host: BotConfig.env.REDIS_HOST,
    port: 13868,
  },
});

await redisClient.connect();
redisClient.on("error", (err) => console.error(err));

{
  (client as ClientWithCollection).messageCounts = new Collection();
  (client as ClientWithCollection).interactionCommands = new Collection();
}

await load_all_events();
await load_all_commands();

client
  .login(BotConfig.env.BOT_API_KEY)
  .then(() => console.log("Initiated"))
  .catch((err) => {
    console.error(err);
  });

async function load_all_commands() {
  const command_dirs = fs.readdirSync(path.join(__dirname, "commands"), {
    recursive: true,
    withFileTypes: true,
  });

  for (const cmd of command_dirs) {
    if (!cmd.isFile()) continue;
    if (extname(cmd.name) !== ".ts") continue;

    const c = (
      await import(pathToFileURL(path.join(cmd.parentPath, cmd.name)).href)
    ).default;

    (client as ClientWithCollection).interactionCommands.set(c.name, c);
  }
}

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
