-- Merge and normalize course columns safely
DO $$
BEGIN
  -- Rename catetgory -> category if appropriate
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'catetgory'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category'
  ) THEN
    EXECUTE 'ALTER TABLE public.courses RENAME COLUMN "catetgory" TO category';
  END IF;

  -- If both coursejson (lowercase) and courseJson (camelCase) exist, copy data and drop the lowercase
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'coursejson'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'courseJson'
  ) THEN
    -- Create a legacy backup column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'courseJson_legacy'
    ) THEN
      EXECUTE 'ALTER TABLE public.courses ADD COLUMN "courseJson_legacy" jsonb';
    END IF;
    -- Copy lowercase data into legacy backup
    EXECUTE 'UPDATE public.courses SET "courseJson_legacy" = coursejson WHERE "courseJson_legacy" IS NULL AND coursejson IS NOT NULL';
    -- Fill missing camelCase values from lowercase
    EXECUTE 'UPDATE public.courses SET "courseJson" = coursejson WHERE "courseJson" IS NULL AND coursejson IS NOT NULL';
    -- Drop the old lowercase column
    EXECUTE 'ALTER TABLE public.courses DROP COLUMN IF EXISTS coursejson';
  ELSIF EXISTS (
    -- If only lowercase exists and camelCase doesn't, rename lowercase to camelCase
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'coursejson'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'courseJson'
  ) THEN
    EXECUTE 'ALTER TABLE public.courses RENAME COLUMN coursejson TO "courseJson"';
  END IF;
END$$;
