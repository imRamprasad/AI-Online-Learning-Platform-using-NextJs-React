-- Idempotent migration: ensure courses table has the expected columns
-- Adds category, courseJson, numberOfChapters, includeVideo, level and ensures cid is uuid-compatible

-- Enable pgcrypto for gen_random_uuid() if not present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create courses table if it's missing (safe guard - won't overwrite existing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses'
  ) THEN
    CREATE TABLE public.courses (
      id bigserial PRIMARY KEY,
      cid varchar(255),
      name varchar(255),
      description varchar(1024),
      numberOfChapters integer DEFAULT 0,
      includeVideo boolean DEFAULT false,
      level varchar(500),
      category varchar(500),
      courseJson jsonb,
      userEmail varchar(255)
    );
  END IF;
END$$;

-- Add missing columns if they don't exist
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category varchar(500),
  ADD COLUMN IF NOT EXISTS courseJson jsonb,
  ADD COLUMN IF NOT EXISTS numberOfChapters integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS includeVideo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS level varchar(500),
  ADD COLUMN IF NOT EXISTS userEmail varchar(255);

-- Ensure cid has a unique index; do not change type here to avoid data loss
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'courses_cid_idx'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS courses_cid_idx ON public.courses (cid);
  END IF;
END$$;

-- Safety: keep migration idempotent
