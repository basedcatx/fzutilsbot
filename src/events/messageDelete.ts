import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { RedisStore } from "../misc/store";
import { db, rdb } from "../../db/db";
import { messageEventTable } from "../../db/schema";

const event = {
  name: Events.MessageDelete,
  once: false,
  async execute(_: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    let authorId = interaction.author?.id;

    const temp = JSON.parse(
      (await rdb.hGet(RedisStore.MessageEvent, interaction.id)) ??
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

    const value = Math.min(
      (await rdb.zIncrBy(RedisStore.GangLeaderBoard, -1, gang.id)) ?? 0,
      0,
    );

    await Promise.all([
      rdb.zAdd(RedisStore.GangLeaderBoard, { score: value, value: gang.id }),
      db
        .insert(messageEventTable)
        .values({
          userId: authorId,
          messageCount: value,
        })
        .onConflictDoUpdate({
          target: [messageEventTable.userId, messageEventTable.createdAt],
          set: { messageCount: value },
        }),
    ]);
  },
};

export default event;
