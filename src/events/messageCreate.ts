import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { RedisKeys, RedisStore } from "../misc/store";
import { db, rdb } from "../../db/db";
import { messageEventTable } from "../../db/schema";
import ms from "ms";

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

    const oldGangId = await rdb.hGet(
      RedisStore.Users(author.id),
      RedisKeys.Gang,
    );

    if (oldGangId && oldGangId !== gang.id) {
      await changeUserGang(author.id, oldGangId, gang.id);
    }

    await rdb.set(
      RedisStore.Message(interaction.id),
      JSON.stringify({ author: author.id, type: interaction.type }),
      {
        PX: ms("2 days"),
      },
    );

    const [newAllTimeCount, newDailyCount] = await Promise.all([
      rdb.zIncrBy(RedisStore.AllTimeGangLeaderBoard(gang.id), 1, author.id),
      rdb.zIncrBy(RedisStore.DailyGangLeaderBoard(gang.id), 1, author.id),
    ]);

    await rdb.expire(
      RedisStore.DailyGangLeaderBoard(gang.id),
      ms("2 days"),
      "NX",
    );

    await rdb.hSet(RedisStore.Users(author.id), {
      gang: gang.id,
      messageCount: newAllTimeCount,
    });

    await rdb.expire(RedisStore.Users(author.id), ms("2 days"));

    try {
      await db
        .insert(messageEventTable)
        .values({
          userId: author.id,
          userRole: gang.id,
        })
        .onConflictDoUpdate({
          target: [messageEventTable.userId, messageEventTable.createdAt],
          set: { messageCount: newDailyCount },
        });
    } catch (er) {
      console.log(er);
    }
  },
};

async function changeUserGang(
  id: string,
  oldGangId: string,
  newGangId: string,
) {
  await Promise.all([
    rdb.zRem(RedisStore.AllTimeGangLeaderBoard(oldGangId), id),
    rdb.zRem(RedisStore.DailyGangLeaderBoard(oldGangId), id),
  ]);

  await Promise.all([
    rdb.zAdd(RedisStore.AllTimeGangLeaderBoard(oldGangId), {
      score: 0,
      value: id,
    }),
    rdb.zAdd(RedisStore.DailyGangLeaderBoard(oldGangId), {
      score: 0,
      value: id,
    }),
  ]);

  await rdb.hSet(RedisStore.Users(id), RedisKeys.Gang, newGangId);

  await db
    .insert(messageEventTable)
    .values({
      userId: id,
      messageCount: 0,
    })
    .onConflictDoUpdate({
      target: [messageEventTable.userId, messageEventTable.createdAt],
      set: { messageCount: 0 },
    });
}

export default event;
