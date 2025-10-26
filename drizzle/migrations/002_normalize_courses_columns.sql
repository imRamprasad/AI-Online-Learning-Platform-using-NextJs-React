-- Idempotent migration to normalize course columns
-- 1) Rename `catetgory` -> `category` if needed
-- 2) Normalize `coursejson` -> `courseJson`. If both exist, preserve `coursejson` into `courseJson_legacy` to avoid data loss

DO $$
BEGIN
  -- Rename catetgory -> category when appropriate
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'catetgory'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category'
  ) THEN
    EXECUTE 'ALTER TABLE public.courses RENAME COLUMN "catetgory" TO category';
  END IF;

  -- If a lowercase coursejson exists and no camelCase courseJson, rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'coursejson'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'courseJson'
  ) THEN
    EXECUTE 'ALTER TABLE public.courses RENAME COLUMN coursejson TO "courseJson"';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'coursejson'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'courseJson'
  ) THEN
    -- Both exist: preserve coursejson into courseJson_legacy to avoid overwriting user data
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'courseJson_legacy'
    ) THEN
      EXECUTE 'ALTER TABLE public.courses ADD COLUMN "courseJson_legacy" jsonb';
      -- Copy data from coursejson into legacy column where legacy is null
      EXECUTE 'UPDATE public.courses SET "courseJson_legacy" = coursejson WHERE "courseJson_legacy" IS NULL';
    END IF;
  END IF;
END$$;
