import type {
  Client,
  Collection,
  CommandInteraction,
  type Interaction,
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

export interface SlashCommandType {
  name: string;
  description: string;
  cooldown: number;
  execute: (client: ClientWithCollection, interaction: any) => Promise<void>;
}

export const enum RedisStore {
  MessageCount = "msgcount",
}
