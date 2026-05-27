import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { RedisStore } from "../misc/store";
import { messageEventTable } from "../../db/schema";
import ms from "ms";
import { db, rdb } from "../../db/db";
import { sql } from "drizzle-orm";

const event = {
  name: Events.MessageCreate,
  once: false,
  async execute(_: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    if (interaction.author.bot) return;
    if (interaction.type !== MessageType.Default) return;
    const author = interaction.guild.members.cache.get(interaction.author.id);
    if (!author) return;

    const gang = author.roles.cache.find((r) =>
      r.name.toLocaleLowerCase().startsWith("gang:"),
    );

    if (!gang) return;

    const oldGangId = await rdb.get(RedisStore.Users(author.id));

    if (oldGangId && oldGangId !== gang.id) {
      await changeUserGang(author.id, gang.id);
    }

    await rdb.hSet(
      RedisStore.MessageEvent,
      interaction.id,
      JSON.stringify({ author: author.id, type: interaction.type }),
    );

    await rdb.zIncrBy(RedisStore.GangLeaderBoard, 1, gang.id);
    await rdb.set(RedisStore.Users(author.id), gang.id);
    await rdb.expire(RedisStore.Users(author.id), ms("2 days"));

    try {
      await db
        .insert(messageEventTable)
        .values({
          userId: author.id,
          userRole: gang.id,
          messageCount: 1,
        })
        .onConflictDoUpdate({
          target: [messageEventTable.userId, messageEventTable.createdAt],
          set: {
            messageCount: sql<number>`${messageEventTable.messageCount} + 1`,
          },
        });
    } catch (er) {
      console.log(er);
    }
  },
};

async function changeUserGang(id: string, newGangId: string) {
  await rdb.set(RedisStore.Users(id), newGangId);

  await db
    .insert(messageEventTable)
    .values({
      userId: id,
      userRole: newGangId,
      messageCount: 1,
    })
    .onConflictDoUpdate({
      target: [messageEventTable.userId, messageEventTable.createdAt],
      set: { messageCount: 1, userRole: newGangId },
    });
}

export default event;
