import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { RedisStore } from "../misc/store";
import { db, rdb } from "../../db/db";
import { messageEventTable } from "../../db/schema";
import { eq } from "drizzle-orm";
const event = {
  name: Events.MessageDelete,
  once: false,
  async execute(_: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;

    let authorId = interaction.author?.id;
    const temp = JSON.parse(
      (await rdb.get(RedisStore.Message(interaction.id))) ??
        '{author: "", type: 0}',
    );

    if (!authorId) {
      authorId = temp.author;
    }

    if (!authorId) return;

    let author = interaction.guild.members.cache.get(authorId);
    if (!author) {
      author = await interaction.guild.members.fetch(authorId);
    }
    if (!author) return;

    const gang = author.roles.cache.find((r) =>
      r.name.toLowerCase().startsWith("gang:"),
    );
    if (!gang) return;

    if (!interaction.type) {
      const type = temp.type;
      if (type !== MessageType.Default) return;
    } else {
      //@ts-ignore
      if (interaction.type !== MessageType.Default) return;
    }
    console.log("here");

    let decr = await rdb.zIncrBy(
      RedisStore.DailyGangLeaderBoard(gang.id),
      -1,
      authorId,
    );

    console.log(decr);

    if (!decr || decr < 0) {
      decr = (
        await db
          .select()
          .from(messageEventTable)
          .where(eq(messageEventTable.userId, authorId))
      )[0]?.messageCount!;
    }

    if (!decr || decr < 0) {
      const res = await Promise.all([
        rdb.zAdd(RedisStore.DailyGangLeaderBoard(gang.id), {
          score: 0,
          value: authorId,
        }),
        rdb.zAdd(RedisStore.AllTimeGangLeaderBoard(gang.id), {
          score: 0,
          value: authorId,
        }),
      ]);

      decr = res[0] || 0;
    }

    try {
      await db
        .insert(messageEventTable)
        .values({
          userId: authorId,
          messageCount: decr,
        })
        .onConflictDoUpdate({
          target: [messageEventTable.userId, messageEventTable.createdAt],
          set: { messageCount: decr },
        });
    } catch (e) {
      console.log(e);
    }
  },
};

export default event;
