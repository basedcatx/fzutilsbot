import { CommandInteraction, Events } from "discord.js";
import type { ClientWithCollection } from "../types";

const event = {
  name: Events.InteractionCreate,
  once: false,
  async execute(client: ClientWithCollection, interaction: CommandInteraction) {
    if (!interaction.inGuild()) return;
    if (interaction.user.bot) return;

    const cmd = client.interactionCommands.get(interaction.commandName);
    if (!cmd) return;
    await cmd.execute(client, interaction);
  },
};

export default event;
