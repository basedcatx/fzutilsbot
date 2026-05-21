import {
  AttachmentBuilder,
  GuildMember,
  SlashCommandBuilder,
  type Interaction,
} from "discord.js";
import type { ClientWithCollection, SlashCommandType } from "../../types";
import { redisClient } from "../..";
import { RedisStore } from "../../misc/store";
import { db } from "../../../db/db";
import { messageEventTable } from "../../../db/schema";
import { and, eq, desc, asc } from "drizzle-orm";
import dayjs from "dayjs";
import { generateGangProfileCard } from "../../misc/generateProfileCard";

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
    const member = interaction.member as GuildMember;
    if (!member) return;

    const g = member.roles.cache.find((r) =>
      r.name.toLowerCase().startsWith("gang:"),
    );
    if (!g) return;

    if (scope === "local") {
      if (type === "personal") {
        const res = await Promise.all([
          db
            .select()
            .from(messageEventTable)
            .where(
              eq(
                messageEventTable.createdAt,
                new Date().toISOString().split("T")[0]!,
              ),
            )
            .orderBy(desc(messageEventTable.messageCount)),
          db
            .select()
            .from(messageEventTable)
            .where(and(eq(messageEventTable.userId, member.id)))
            .orderBy(asc(messageEventTable.createdAt)),
        ]);

        const userRank = res[0].findIndex((u) => u.userId === member.id) + 1;

        const duration = dayjs(new Date().toISOString())
          .diff(res[1][0]?.createdAt, "day", true)
          .toFixed(1);

        //@ts-ignore
        const mAllTime = res[1].reduce((prev, curr) => {
          const res = prev + (curr.messageCount ?? 0);
          return res;
        }, 0);

        const mToday = res[1]?.at(-1)?.messageCount ?? 0;

        const mGangAllTime = res[0]
          .filter((r) => r.userRole === g.id)
          .reduce((prev, curr) => {
            return prev + (curr.messageCount ?? 0);
          }, 0);

        console.log(mAllTime, mGangAllTime, 0);
        const attachment = new AttachmentBuilder(
          await generateGangProfileCard({
            avatarUrl: member.displayAvatarURL({
              extension: "png",
              forceStatic: true,
            }),
            name: member.displayName,
            gang: { totalMessages: mGangAllTime, name: g.name.toUpperCase() },
            rank: userRank,
            daysInGang: Number(duration) ?? 0,
            msgs: [mAllTime, mToday],
          }),
          { name: "profile-card.png" },
        );

        console.log(attachment.attachment);
        await interaction.reply({ files: [attachment] });
        return;
      }
      // type: global
      return;
    }

    if (scope === "global") {
      if (type === "personal") {
        await interaction.reply({
          content:
            "You can use the /me command, to see your global (server-wide) message ranking",
        });
        return;
      }
      return;
    }

    await interaction.reply({
      content: `${await redisClient.hGet(RedisStore.Users(member.user.id), "message_count")} messages`,
    });
  },
};

export default cmd;
