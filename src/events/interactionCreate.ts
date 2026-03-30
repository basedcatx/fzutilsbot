import { Client, CommandInteraction, Events } from "discord.js";

const event = {
  name: Events.InteractionCreate,
  once: false,
  async execute(client: Client, interaction: CommandInteraction) {},
};

export default event;
