import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { RedisStore } from "../misc/store";
import { db, rdb } from "../../db/db";
import { messageEventTable } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const event = {
  name: Events.MessageCreate,
  once: false,
  async execute(_: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    if (interaction.author.bot) return;
    if (interaction.type !== MessageType.Default) return;
    const author = interaction.guild.members.cache.get(interaction.author.id);
    if (!author) return;

    let old = Number(
      rdb.hGet(RedisStore.Users(author.id), "message_count"),
    );

    if (!old) {
      const res = await db
        .select()
        .from(messageEventTable)
        .where(
          and(
            eq(messageEventTable.userId, author.id),
            eq(
              messageEventTable.createdAt,
              new Date().toISOString().split("T")[0]!,
            ),
          ),
        )
        .limit(1);
      old = res[0]?.messageCount ?? 0;
    }

    try {
      await db
        .insert(messageEventTable)
        .values({
          userId: author.id,
          userRole:
            author.roles.cache.find((r) =>
              r.name.toLocaleLowerCase().startsWith("gang:"),
            )?.id ?? "",
        })
        .onConflictDoUpdate({
          target: [messageEventTable.userId, messageEventTable.createdAt],
          set: { messageCount: old + 1 },
        });
    } catch (er) {
      console.log(er);
    }

    rdb.set(RedisStore.Message(interaction.id), author.id, {
      EX: 172800,
    });

    return rdb.hSet(
      RedisStore.Users(author.id),
      "message_count",
      old + 1,
    );
  },
};

export default event;
