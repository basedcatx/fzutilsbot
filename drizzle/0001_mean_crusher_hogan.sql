ALTER TABLE "message_event" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
CREATE UNIQUE INDEX "ui_user_id_date" ON "message_event" USING btree ("user_id","user_role");