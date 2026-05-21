import { Events, Message, MessageType } from "discord.js";

import { type ClientWithCollection } from "../types";
import { hGetHelper, hSetHelper } from "../utils";
import { RedisStore } from "../misc/store";
import { db } from "../../db/db";
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

    let old = Number(hGetHelper(RedisStore.MessageCount, `user:${author.id}`));

    if (!old) {
      const res = await db .select() .from(messageEventTable)
        .where(
          and(
            eq(messageEventTable.userId, author.id),
            eq(messageEventTable.createdAt, Date()),
          ),
        )
        .limit(1);

      old = res[0]?.messageCount ?? 0;
    }

    hSetHelper(RedisStore.MessageCount, `user:${author.id}`, old + 1);
  },
};

export default event;
