import {
  PermissionsBitField,
  type Client,
  type GuildChannel,
} from "discord.js";
import type { ClientWithCollection } from "./types";

export function hasPermissionsInChannel(
  client: ClientWithCollection | Client,
  channel: GuildChannel,
  perms: bigint[],
) {
  const permissions =
    channel.permissionsFor(client.user?.id!) || new PermissionsBitField();
  return permissions.has(perms);
}
