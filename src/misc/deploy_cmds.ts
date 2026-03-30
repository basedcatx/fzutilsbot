import { readdirSync } from "fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { REST, Routes } from "discord.js";
import { BotConfig } from "../config";

async function load_commands() {
  const commands: any[] = [];

  const command_dirs = readdirSync(
    pathToFileURL(path.join(__dirname, "..", "commands")),
    {
      withFileTypes: true,
      recursive: true,
    },
  );

  for (const command of command_dirs) {
    if (command.isDirectory()) continue;

    const fullPath = pathToFileURL(path.join(command.parentPath, command.name));

    const obj = await import(fullPath.href);

    const {
      default: { name, description, execute },
    } = obj;

    if (!name || !description || !execute) {
      console.log(
        `Sorry a command file found couldn't be loaded due to missing fields. Name: ${name}, desc: ${description}, exec: ${execute ? "defined" : "undefined"}`,
      );
      continue;
    }

    commands.push(obj.default);
  }

  return commands;
}

const rest = new REST().setToken(BotConfig.env.BOT_API_KEY);

rest
  .put(
    Routes.applicationGuildCommands(
      BotConfig.env.BOT_ID,
      BotConfig.guild.SUPPORT_SERVER_ID,
    ),
    {
      body: await load_commands(),
    },
  )
  .then((_) => console.log("All commands successfully registered"));
