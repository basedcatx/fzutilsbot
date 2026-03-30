import type {
  Client,
  Collection,
  CommandInteraction,
  Interaction,
  Message,
  Snowflake,
} from "discord.js";

export interface ClientWithCollection extends Client {
  // user-id, message count
  messageCounts: Collection<Snowflake, number>;
  interactionCommands: Collection<
    string,
    {
      name: string;
      description: string;
      execute: (
        client: Client | ClientWithCollection,
        interaction: CommandInteraction | Message,
      ) => Promise<void>;
    }
  >;
}
