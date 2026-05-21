import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { RedisStore } from "../misc/store";
import { db } from "../../db/db";
import { messageEventTable } from "../../db/schema";
import { redisClient } from "..";
import { eq } from "drizzle-orm";

const event = {
  name: Events.MessageDelete,
  once: false,
  async execute(_: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    if (interaction.author.bot) return;
    if (interaction.type !== MessageType.Default) return;
    const author = interaction.guild.members.cache.get(interaction.author.id);
    if (!author) return;

    let decr = Number(
      redisClient.hGet(RedisStore.Users(author.id), "message_count"),
    );

    if (!decr) {
      decr = (
        await db
          .select()
          .from(messageEventTable)
          .where(eq(messageEventTable.userId, author.id))
      )[0]?.messageCount!;
    }

    if (!decr || decr < 0) {
      redisClient.hSet(RedisStore.Users(author.id), "message_count", 0);
    }

    console.log(decr);

    const gangRole = author.roles.cache.find((role) =>
      role.name.toLowerCase().startsWith("gang:"),
    );

    redisClient.hSet(RedisStore.Users(author.id), "message_count", decr - 1);

    try {
      await db
        .insert(messageEventTable)
        .values({
          userId: author.id,
          userRole: gangRole?.id ?? "",
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
