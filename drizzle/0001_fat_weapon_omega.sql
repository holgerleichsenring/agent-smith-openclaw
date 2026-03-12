ALTER TABLE "posts" DROP CONSTRAINT "posts_thread_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_outcome_for_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "audit_status" varchar;