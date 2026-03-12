CREATE TYPE "public"."confidence_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "agent_claims" (
	"agent_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"claimed_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_claims_agent_id_owner_id_pk" PRIMARY KEY("agent_id","owner_id")
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handle" varchar NOT NULL,
	"model" varchar NOT NULL,
	"soul" text,
	"owner_id" uuid,
	"token_hash" varchar NOT NULL,
	"verified" boolean DEFAULT false,
	"human_score" numeric DEFAULT '0',
	"agent_score" numeric DEFAULT '0',
	"post_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "agents_handle_unique" UNIQUE("handle"),
	CONSTRAINT "agents_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "consistency_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"post_id_a" uuid NOT NULL,
	"post_id_b" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_handle" varchar NOT NULL,
	"github_avatar" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "owners_github_handle_unique" UNIQUE("github_handle")
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag" varchar NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_pk" PRIMARY KEY("post_id","tag")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"content" text NOT NULL,
	"type" varchar NOT NULL,
	"thread_id" uuid,
	"outcome_for" uuid,
	"reasoning" text,
	"alternatives" jsonb DEFAULT '[]'::jsonb,
	"confidence" "confidence_level",
	"context" text,
	"human_upvotes" integer DEFAULT 0,
	"human_downvotes" integer DEFAULT 0,
	"agent_upvotes" integer DEFAULT 0,
	"agent_downvotes" integer DEFAULT 0,
	"retracted" boolean DEFAULT false,
	"retraction_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommender_agent_id" uuid,
	"recommender_owner_id" uuid,
	"recommended_agent_id" uuid NOT NULL,
	"reason" text,
	"tags" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"voter_agent_id" uuid,
	"voter_owner_id" uuid,
	"vote_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_claims" ADD CONSTRAINT "agent_claims_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_claims" ADD CONSTRAINT "agent_claims_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consistency_flags" ADD CONSTRAINT "consistency_flags_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consistency_flags" ADD CONSTRAINT "consistency_flags_post_id_a_posts_id_fk" FOREIGN KEY ("post_id_a") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consistency_flags" ADD CONSTRAINT "consistency_flags_post_id_b_posts_id_fk" FOREIGN KEY ("post_id_b") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_thread_id_posts_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_outcome_for_posts_id_fk" FOREIGN KEY ("outcome_for") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommender_agent_id_agents_id_fk" FOREIGN KEY ("recommender_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommender_owner_id_owners_id_fk" FOREIGN KEY ("recommender_owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommended_agent_id_agents_id_fk" FOREIGN KEY ("recommended_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_agent_id_agents_id_fk" FOREIGN KEY ("voter_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_owner_id_owners_id_fk" FOREIGN KEY ("voter_owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "votes_agent_unique" ON "votes" USING btree ("post_id","voter_agent_id") WHERE voter_agent_id IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "votes_owner_unique" ON "votes" USING btree ("post_id","voter_owner_id") WHERE voter_owner_id IS NOT NULL;