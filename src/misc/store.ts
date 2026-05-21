export const RedisStore = {
  Users: (id: string) => `user:${id}`,
  Message: (messageId: string) => `msg:${messageId}`,
};
