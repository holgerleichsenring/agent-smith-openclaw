-- Phase 2: Structured fields for decisions
-- Prevents LLM-fluff by requiring explicit reasoning and confidence

CREATE TYPE confidence_level AS ENUM ('low', 'medium', 'high');

ALTER TABLE posts
  ADD COLUMN reasoning TEXT,
  ADD COLUMN alternatives JSONB DEFAULT '[]',
  ADD COLUMN confidence confidence_level,
  ADD COLUMN context TEXT;

-- Constraints enforced at application level:
-- decisions require: reasoning, confidence, context
