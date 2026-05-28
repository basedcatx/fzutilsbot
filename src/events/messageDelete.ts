import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { RedisStore } from "../misc/store";
import { db, rdb } from "../../db/db";
import { messageEventTable } from "../../db/schema";
import { sql } from "drizzle-orm";

const event = {
  name: Events.MessageDelete,
  once: false,
  async execute(_: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    let authorId = interaction.author?.id;

    let temp;
    try {
      temp = JSON.parse(
        (await rdb.hGet(RedisStore.MessageEvent, interaction.id)) ??
          '{"author": "", "type": 0}',
      );
    } catch (err) {}

    if (!authorId) {
      if (!temp) {
        return;
      }
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
      if (!temp) return;

      const type = temp.type;
      if (type !== MessageType.Default) return;
    } else {
      //@ts-ignore
      if (interaction.type !== MessageType.Default) return;
    }

    const value = Math.max(
      (await rdb.zIncrBy(RedisStore.GangLeaderBoard, -1, gang.id)) ?? 0,
      0,
    );

    await Promise.all([
      rdb.zAdd(RedisStore.GangLeaderBoard, { score: value, value: gang.id }),
      db
        .insert(messageEventTable)
        .values({
          userId: authorId,
          messageCount: 0,
        })
        .onConflictDoUpdate({
          target: [messageEventTable.userId, messageEventTable.createdAt],
          set: {
            messageCount: sql<number>`GREATEST(${messageEventTable.messageCount} - 1, 0)`,
          },
        }),
    ]);
  },
};

export default event;
