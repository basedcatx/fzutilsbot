import {
  Client,
  ContainerBuilder,
  SlashCommandBuilder,
  type Interaction,
} from "discord.js";
import type { SlashCommandType } from "../../types";

const command = new SlashCommandBuilder()
  .setName("dismiss")
  .setDescription(
    "Dismisses a member from your gang. You must be a gang leader",
  );

const cmd: SlashCommandType = {
  ...command,
  cooldown: 5,
  async execute(_: Client, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    // would handle this later on
  },
};


function pingComponent(diff: number, wsping: number) {
  return new ContainerBuilder().addTextDisplayComponents((td) =>
    td.setContent(`Ping: ${diff.toString()}ms\nWS: ${wsping}ms`),
  );
}

export default cmd;
