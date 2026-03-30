import { ActivityType, Client, Events } from "discord.js";

const event = {
  name: Events.ClientReady,
  async execute(client: Client) {
    console.log("Client connected and ready");
    client.user?.setPresence({
      activities: [
        { name: "Work currently in progress", type: ActivityType.Custom },
      ],
      status: "online",
    });
  },
};

export default event;
