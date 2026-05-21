import { SlashCommandBuilder, type Interaction } from "discord.js";
import type { ClientWithCollection, SlashCommandType } from "../../types";
import { redisClient } from "../..";
import { RedisStore } from "../../misc/store";

const command = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("View local and global stats of you or your gang")
  .addStringOption((opts) =>
    opts
      .setName("scope")
      .setRequired(true)
      .setDescription(
        "Leaderboard scope ie locally within your gang, or globally against all gangs",
      )
      .addChoices(
        { name: "Local", value: "local" },
        { name: "Global", value: "global" },
      ),
  )
  .addStringOption((opts) =>
    opts
      .setName("type")
      .setRequired(true)
      .setDescription("Local stats (intra-gang) and global stats(inter-gang)")
      .addChoices(
        { name: "Personal", value: "personal" },
        { name: "Gang", value: "gang" },
      ),
  );

const cmd: SlashCommandType = {
  ...command,
  name: "stats",
  cooldown: 5,
  async execute(_: ClientWithCollection, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const type = interaction.options.getString("type");
    const scope = interaction.options.getString("scope");
    const member = interaction.member;

    if (!member) return;

    await interaction.reply({
      content: `${await redisClient.hGet(RedisStore.MessageCount, member.user.id)} messages`,
    });
  },
};

export default cmd;
