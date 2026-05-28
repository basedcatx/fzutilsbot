import { REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import path, { extname } from "node:path";
import { pathToFileURL } from "node:url";
import { BotConfig } from "./config";

const commands = [];
async function loadCommands() {
  const command_dirs = readdirSync(path.join(import.meta.dirname, "commands"), {
    recursive: true,
    withFileTypes: true,
  });

  for (const cmd of command_dirs) {
    if (!cmd.isFile()) continue;
    if (extname(cmd.name) !== ".ts") continue;

    const fullPath = path.join(cmd.parentPath, cmd.name);
    const fileUrl = pathToFileURL(fullPath).href;

    const command = await import(fileUrl);

    const {
      default: { name, description, execute },
    } = command;

    if (!name || !description || !execute) {
      console.log(
        `Sorry a command file found couldn't be loaded due to missing fields. Name: ${name}, desc: ${description}, exec: ${execute ? "defined" : "undefined"}`,
      );
      continue;
    }

    commands.push(command.default);
  }
}

await loadCommands();

const rest = new REST().setToken(BotConfig.env.BOT_API_KEY);

console.log(`Started refreshing ${commands.length} application (/) commands`);

try {
  const data = await rest.put(
    Routes.applicationGuildCommands(
      BotConfig.env.BOT_ID,
      BotConfig.guild.SUPPORT_SERVER_ID,
    ),
    {
      //@ts-ignore
      body: commands,
    },
  );
  console.log(
    `Succesfully reloaded ${(data as any[]).length} application (/) commands.`,
  );
} catch (err) {
  console.error(err);
}
