import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("types", ["CREATE", "DELETE"]);

export const messageEventTable = pgTable(
  "message_event",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    userRole: text("user_role").notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (ctx) => [
    t.index("user_id_idx").on(ctx.userRole),
    t.index("user_role_idx").on(ctx.userRole),
  ],
);
