import { Events, Message, MessageType } from "discord.js";

import { type ClientWithCollection } from "../types";
import { hSetHelper } from "../utils";
import { RedisStore } from "../misc/store";

const event = {
  name: Events.MessageCreate,
  once: false,
  async execute(client: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    if (interaction.author.bot) return;
    if (interaction.type !== MessageType.Default) return;

    const author = interaction.author;

    const incr = (client.messageCounts.get(author.id) || 0) + 1;
    client.messageCounts.set(author.id, incr);
    hSetHelper(RedisStore.MessageCount, author.id, incr);
  },
};

export default event;
