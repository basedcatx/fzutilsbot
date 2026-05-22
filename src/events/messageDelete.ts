import { Events, GuildMember, Message, MessageType } from "discord.js";
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

    if (!authorId) {
      authorId =
        (await rdb.get(RedisStore.Message(interaction.id))) ?? "";
    }

    if (!authorId) return;

    if (interaction.type !== MessageType.Default) return;

    let decr = Number(
      rdb.hGet(RedisStore.Users(authorId), "message_count"),
    );

    if (!decr) {
      decr = (
        await db
          .select()
          .from(messageEventTable)
          .where(eq(messageEventTable.userId, authorId))
      )[0]?.messageCount!;
    }

    if (!decr || decr < 0) {
      rdb.hSet(RedisStore.Users(authorId), "message_count", 0);
    }

    console.log(decr);

    rdb.hSet(RedisStore.Users(authorId), "message_count", decr - 1);

    try {
      await db
        .insert(messageEventTable)
        .values({
          userId: authorId,
          messageCount: decr - 1,
        })
        .onConflictDoUpdate({
          target: [messageEventTable.userId, messageEventTable.createdAt],
          set: { messageCount: decr - 1 },
        });
    } catch (e) {
      console.log(e);
    }
  },
};

export default event;
