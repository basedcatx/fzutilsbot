import { Events, Message, MessageType } from "discord.js";
import type { ClientWithCollection } from "../types";

const event = {
  name: Events.MessageDelete,
  once: false,
  async execute(client: ClientWithCollection, interaction: Message) {
    if (!interaction.inGuild()) return;
    if (interaction.author.bot) return;
    if (interaction.type !== MessageType.Default) return;
    const author = interaction.author;

    const decr = client.messageCounts.get(author.id) || 0;

    if (decr <= 0) {
      return client.messageCounts.set(author.id, 0);
    }

    return client.messageCounts.set(author.id, decr - 1);
  },
};

export default event;
