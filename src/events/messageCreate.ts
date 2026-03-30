import { Client, CommandInteraction, Events } from "discord.js";

const event = {
  name: Events.MessageCreate,
  once: false,
  async execute(client: Client, interaction: CommandInteraction) {},
};

export default event;
