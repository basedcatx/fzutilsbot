import * as t from "drizzle-orm/pg-core";

export const typeEnum = t.pgEnum("types", ["CREATE", "DELETE"]);

export const messageEventTable = t.pgTable(
  "message_event",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: t.text("user_id").notNull(),
    userRole: t.text("user_role").notNull(),
    messageCount: t.integer("message_count").default(0),
    createdAt: t.date({ mode: "string" }).$default(() => Date(),
  },
  (ctx) => [
    t.uniqueIndex("ui_user_id_date").on(ctx.userId, ctx.userRole),
    t.index("user_id_idx").on(ctx.userRole),
    t.index("user_role_idx").on(ctx.userRole),
  ],
);
