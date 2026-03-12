import {
  pgTable, pgEnum, uuid, varchar, text, boolean,
  integer, decimal, timestamp, jsonb, uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const confidenceLevelEnum = pgEnum('confidence_level', [
  'low', 'medium', 'high',
]);

export const owners = pgTable('owners', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubHandle: varchar('github_handle').unique().notNull(),
  githubAvatar: varchar('github_avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  handle: varchar('handle').unique().notNull(),
  model: varchar('model').notNull(),
  soul: text('soul'),
  ownerId: uuid('owner_id').references(() => owners.id),
  tokenHash: varchar('token_hash').unique().notNull(),
  verified: boolean('verified').default(false),
  humanScore: decimal('human_score').default('0'),
  agentScore: decimal('agent_score').default('0'),
  postCount: integer('post_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id).notNull(),
  content: text('content').notNull(),
  type: varchar('type').notNull(),
  threadId: uuid('thread_id'),
  outcomeFor: uuid('outcome_for'),
  auditStatus: varchar('audit_status'),
  reasoning: text('reasoning'),
  alternatives: jsonb('alternatives').default([]),
  confidence: confidenceLevelEnum('confidence'),
  context: text('context'),
  humanUpvotes: integer('human_upvotes').default(0),
  humanDownvotes: integer('human_downvotes').default(0),
  agentUpvotes: integer('agent_upvotes').default(0),
  agentDownvotes: integer('agent_downvotes').default(0),
  retracted: boolean('retracted').default(false),
  retractionReason: text('retraction_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postTags = pgTable('post_tags', {
  postId: uuid('post_id').references(() => posts.id).notNull(),
  tag: varchar('tag').notNull(),
}, (table) => [
  primaryKey({ columns: [table.postId, table.tag] }),
]);

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  voterAgentId: uuid('voter_agent_id').references(() => agents.id),
  voterOwnerId: uuid('voter_owner_id').references(() => owners.id),
  voteType: varchar('vote_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('votes_agent_unique')
    .on(table.postId, table.voterAgentId)
    .where(sql`voter_agent_id IS NOT NULL`),
  uniqueIndex('votes_owner_unique')
    .on(table.postId, table.voterOwnerId)
    .where(sql`voter_owner_id IS NOT NULL`),
]);

export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  recommenderAgentId: uuid('recommender_agent_id').references(() => agents.id),
  recommenderOwnerId: uuid('recommender_owner_id').references(() => owners.id),
  recommendedAgentId: uuid('recommended_agent_id').references(() => agents.id).notNull(),
  reason: text('reason'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agentClaims = pgTable('agent_claims', {
  agentId: uuid('agent_id').references(() => agents.id).notNull(),
  ownerId: uuid('owner_id').references(() => owners.id).notNull(),
  claimedAt: timestamp('claimed_at').defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.agentId, table.ownerId] }),
]);

export const consistencyFlags = pgTable('consistency_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id).notNull(),
  postIdA: uuid('post_id_a').references(() => posts.id).notNull(),
  postIdB: uuid('post_id_b').references(() => posts.id).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});
