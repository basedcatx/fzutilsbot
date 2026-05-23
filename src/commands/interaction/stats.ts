import {
  AttachmentBuilder,
  GuildMember,
  SlashCommandBuilder,
  type Interaction,
} from "discord.js";
import type { ClientWithCollection, SlashCommandType } from "../../types";
import { db, rdb } from "../../../db/db";
import { messageEventTable } from "../../../db/schema";
import { and, eq, desc, asc } from "drizzle-orm";
import dayjs from "dayjs";
import { generateGangProfileCard } from "../../misc/generateProfileCard";
import { sql } from "drizzle-orm";
import { toPNG } from "../../misc/helper";
import { generateGangCard } from "../../misc/generateGangCard";

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

    if (scope === "local") {
      if (type === "personal") {
        await handleLocalPersonal(interaction, member);
      }
      return await handleLocalGlobal(interaction, member);
    }

    if (scope === "global") {
      if (type === "personal") {
        await interaction.reply({
          content:
            "You can use the /me command, to see your global (server-wide) message ranking",
        });
        return;
      }
      return await handleGlobalGlobal(interaction, member);
    }
  },
};

async function handleLocalPersonal(
  interaction: Interaction,
  member: GuildMember,
) {
  if (!interaction.isChatInputCommand()) return;

  const g = member.roles.cache.find((r) =>
    r.name.toLowerCase().startsWith("gang:"),
  );
  if (!g) return;

  const res = await Promise.all([
    db
      .select()
      .from(messageEventTable)
      .where(
        and(
          eq(messageEventTable.userRole, g.id),
          eq(
            messageEventTable.createdAt,
            new Date().toISOString().split("T")[0]!,
          ),
        ),
      )
      .orderBy(desc(messageEventTable.messageCount)),
    db
      .select()
      .from(messageEventTable)
      .where(and(eq(messageEventTable.userId, member.id)))
      .orderBy(asc(messageEventTable.createdAt)),
    db
      .select({
        userId: messageEventTable.userId,
        messageCount: sql<number>`sum(${messageEventTable.messageCount})::int`,
      })
      .from(messageEventTable)
      .groupBy(messageEventTable.userId)
      .orderBy((fields) => desc(fields.messageCount)),
  ]);

  const userRank = res[0].findIndex((u) => u.userId === member.id) + 1;
  const userAllTimeRank = res[2].findIndex((u) => u.userId === member.id) + 1;

  const duration = dayjs(new Date().toISOString())
    .diff(res[1][0]?.createdAt, "day", true)
    .toFixed(1);

  //@ts-ignore
  const mAllTime = res[1].reduce((prev, curr) => {
    const res = prev + (curr.messageCount ?? 0);
    return res;
  }, 0);

  const mToday = res[1]?.at(-1)?.messageCount ?? 0;

  const mGangAllTime = res[1]
    .filter((r) => r.userRole === g.id)
    .reduce((prev, curr) => {
      return prev + (curr.messageCount ?? 0);
    }, 0);

  const attachment = new AttachmentBuilder(
    await generateGangProfileCard({
      avatarUrl: member.displayAvatarURL({
        extension: "png",
        forceStatic: true,
      }),
      name: member.displayName,
      gang: { totalMessages: mGangAllTime, name: g.name.toUpperCase() },
      ranks: [userAllTimeRank, userRank],
      daysInGang: Number(duration) ?? 0,
      msgs: [mAllTime, mToday],
      guildIcon:
        interaction.guild?.iconURL({
          extension: "png",
          forceStatic: true,
        }) ?? undefined,
    }),
    { name: "profile-card.png" },
  );

  await interaction.reply({ files: [attachment] });
  return;
}

async function handleLocalGlobal(
  interaction: Interaction,
  member: GuildMember,
) {
  if (!interaction.isChatInputCommand()) return;

  const g = member.roles.cache.find((r) =>
    r.name.toLowerCase().startsWith("gang:"),
  );
  if (!g) return;

  const res = await Promise.all([
    db
      .select({
        id: messageEventTable.userRole,
        totalMessages: sql<number>`sum(${messageEventTable.messageCount})::int`,
        createdAt: messageEventTable.createdAt,
      })
      .from(messageEventTable)
      .groupBy(messageEventTable.createdAt, messageEventTable.userRole)
      .orderBy(sql`sum(${messageEventTable.messageCount})::int desc`),
    db
      .select({
        id: messageEventTable.userRole,
        totalMessages: sql<number>`sum(${messageEventTable.messageCount})::int`,
        createdAt: messageEventTable.createdAt,
      })
      .from(messageEventTable)
      .groupBy(messageEventTable.createdAt, messageEventTable.userRole)
      .orderBy(asc(messageEventTable.createdAt)),
  ]);

  const msgs = res[1]
    //@ts-ignore
    .reduce((prev, curr) => {
      const res: number[] = [...prev];
      res.push(curr.totalMessages);
      return res;
    }, [])
    //@ts-ignore
    .slice(-7);

  const gangs = res[0]
    .filter((r) => r.id != g.id)
    .map((t) => {
      const role = interaction.guild?.roles.cache.get(t.id!);
      const leader =
        role?.members.find((m) =>
          m.roles.cache.find((r) => r.name.toLowerCase().includes("leader")),
        )?.displayName ?? "None";

      return {
        msgs: t.totalMessages,
        leader,
        name: role?.name ?? "N/A",
      };
    });

  const nextInLine = gangs[0]!;

  const attachment = new AttachmentBuilder(
    toPNG(
      await generateGangCard({
        name: g.name,
        msgs,
        ranking: [2, 3],
        gangs,
        nextInLine,
      }),
    ),
    { name: "gang-card.png" },
  );

  await interaction.reply({ files: [attachment] });
}

async function handleGlobalGlobal(
  interaction: Interaction,
  member: GuildMember,
) {
  if (!interaction.isChatInputCommand()) return;
}

export default cmd;
