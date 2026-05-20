import {
  PermissionsBitField,
  type Client,
  type GuildChannel,
} from "discord.js";
import type { ClientWithCollection } from "./types";
import { redisClient } from ".";
import { RedisStore } from "./misc/store";

export function hasPermissionsInChannel(
  client: ClientWithCollection | Client,
  channel: GuildChannel,
  perms: bigint[],
) {
  const permissions =
    channel.permissionsFor(client.user?.id!) || new PermissionsBitField();
  return permissions.has(perms);
}

export function hSetHelper(store: RedisStore, key: string, value: number) {
  if (!redisClient.isOpen) return;
  redisClient.hSet(store, key, value);
}

export async function incrementMessageCount(userId: string) {
  const old = await redisClient.hGet(RedisStore.MessageCount, userId);
  if (!old) return redisClient.hSet(RedisStore.MessageCount, userId, 0);
  redisClient.hIncrBy(RedisStore.MessageCount, userId, 1);
}

export async function decrementMessageCount(userId: string) {
  const val = await redisClient.hIncrBy(RedisStore.MessageCount, userId, -1);
  if (val < 0) await redisClient.hSet(RedisStore.MessageCount, userId, 0);
}

export function formatNumberWithK(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}
