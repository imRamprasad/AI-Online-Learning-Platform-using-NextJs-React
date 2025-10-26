#!/usr/bin/env node
(async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('ERROR: DATABASE_URL not set in environment.');
      process.exit(1);
    }

    const { neon } = await import('@neondatabase/serverless');
    const client = neon(DATABASE_URL);

    console.log('Connected to DB. Current columns:');
  const colsResRaw = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position;`);
  const cols = Array.isArray(colsResRaw) ? colsResRaw : (colsResRaw.rows || []);
  cols.forEach((r) => console.log(`- ${r.column_name} (${r.data_type})`));

    // Rename catetgory -> category
  const hasCatetgory = cols.some(r => r.column_name === 'catetgory');
  const hasCategory = cols.some(r => r.column_name === 'category');
    if (hasCatetgory && !hasCategory) {
      try {
        console.log('\nRenaming catetgory -> category...');
        await client.query('ALTER TABLE public.courses RENAME COLUMN "catetgory" TO category;');
        console.log('Renamed catetgory -> category');
      } catch (e) {
        console.error('Failed to rename catetgory:', e.message || e);
      }
    } else {
      console.log('\nNo catetgory rename needed');
    }

    // Normalize coursejson -> courseJson
  const hasCoursejson = cols.some(r => r.column_name === 'coursejson');
  const hasCourseJson = cols.some(r => r.column_name === 'courseJson');
    if (hasCoursejson && !hasCourseJson) {
      try {
        console.log('\nRenaming coursejson -> courseJson...');
        await client.query('ALTER TABLE public.courses RENAME COLUMN coursejson TO "courseJson";');
        console.log('Renamed coursejson -> courseJson');
      } catch (e) {
        console.error('Failed to rename coursejson:', e.message || e);
      }
    } else if (hasCoursejson && hasCourseJson) {
      try {
        console.log('\nBoth coursejson and courseJson exist — copying lowercase into courseJson_legacy and filling missing courseJson values');
        await client.query('ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "courseJson_legacy" jsonb;');
        await client.query('UPDATE public.courses SET "courseJson_legacy" = coursejson WHERE "courseJson_legacy" IS NULL AND coursejson IS NOT NULL;');
        await client.query('UPDATE public.courses SET "courseJson" = coursejson WHERE "courseJson" IS NULL AND coursejson IS NOT NULL;');
        await client.query('ALTER TABLE public.courses DROP COLUMN IF EXISTS coursejson;');
        console.log('Consolidated and removed coursejson');
      } catch (e) {
        console.error('Failed to consolidate coursejson:', e.message || e);
      }
    } else {
      console.log('\nNo coursejson normalization needed');
    }

    // Final columns
  const finalRaw = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position;`);
  const finalCols = Array.isArray(finalRaw) ? finalRaw : (finalRaw.rows || []);
  console.log('\nFinal courses table columns:');
  finalCols.forEach((r) => console.log(`- ${r.column_name} (${r.data_type})`));

    if (typeof client.end === 'function') await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(2);
  }
})();
