import {
  type Interaction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import type { ClientWithCollection, SlashCommandType } from "../../types";

const command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pings the bot to check it's status");

const cmd: SlashCommandType = {
  ...command,
  cooldown: 5,
  name: "ping",
  async execute(_: ClientWithCollection, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    const now = Date.now();
    interaction.reply({
      components: [pingComponent(Date.now() - now, _.ws.ping)],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

function pingComponent(diff: number, wsping: number) {
  return new ContainerBuilder().addTextDisplayComponents((td) =>
    td.setContent(`Ping: ${diff.toString()}ms\nWS: ${wsping}ms`),
  );
}

export default cmd;
