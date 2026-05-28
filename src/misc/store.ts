export const RedisStore = {
  Users: (id: string) => `user:${id}`,
  MessageEvent: "msg_events",
  GangLeaderBoard: "gang_leaderboard",
  GangLeaderBoardS: "gang_leaderboar_snapshot",
} as const;

export const enum RedisKeys {
  MsgCount = "msgCount",
  Gang = "gang",
}
