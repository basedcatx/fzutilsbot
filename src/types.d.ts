import type { Client, Collection, Snowflake } from "discord.js";

export interface ClientWithCollection extends Client {
  // user-id, message count
  messageCounts: Collection<Snowflake, number>;
}
