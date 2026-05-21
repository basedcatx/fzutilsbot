import { Events, Message, MessageType } from "discord.js";
import { type ClientWithCollection } from "../types";
import { hGetHelper, hSetHelper } from "../utils";
import { RedisStore } from "../misc/store";
import { db } from "../../db/db";
import { messageEventTable } from "../../db/schema";

const event = {
  name: Events.MessageDelete,
  once: false,
  async execute(_: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    if (interaction.author.bot) return;
    if (interaction.type !== MessageType.Default) return;
    const author = interaction.guild.members.cache.get(interaction.author.id);
    if (!author) return;

    const decr =
      Number(hGetHelper(RedisStore.MessageCount, `user:${author.id}`)) ?? 0;

    if (decr <= 0) {
      hSetHelper(RedisStore.MessageCount, author.id, 0);
    }

    const gangRole = author.roles.cache.find((role) =>
      role.name.toLowerCase().startsWith("gang:"),
    );

    hSetHelper(RedisStore.MessageCount, `user:${author.id}`, decr - 1);

    try {
      db.insert(messageEventTable)
        .values({
          userId: author.id,
          userRole: gangRole?.id ?? "",
          messageCount: decr - 1,
        })
        .onConflictDoUpdate({
          target: messageEventTable.userId,
          set: { messageCount: decr - 1 },
        });
    } catch (e) {
      console.log(e);
    }

  },
};

export default event;
