import {
  Client,
  CommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

const command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pings the bot to check it's status");

const cmd = {
  ...command,
  timeout: 5,
  async execute(_: Client, interaction: CommandInteraction) {
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
