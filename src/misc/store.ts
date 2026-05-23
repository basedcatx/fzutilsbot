export const RedisStore = {
  Users: (id: string) => `user:${id}`,
  Message: (messageId: string) => `msg:${messageId}`,
  AllTimeGangLeaderBoard: (gangId: string) => `all_time_lb:gang:${gangId}`,
  DailyGangLeaderBoard: (gangId: string) => `daily_lb:gang:${gangId}`,
} as const;

export const enum RedisKeys {
  MsgCount = "msgCount",
  Gang = "gang",
}
