CREATE TYPE "public"."types" AS ENUM('CREATE', 'DELETE');--> statement-breakpoint
CREATE TABLE "message_event" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"user_role" text NOT NULL,
	"message_count" integer DEFAULT 0,
	"created_at" date DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "message_event" USING btree ("user_role");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "message_event" USING btree ("user_role");