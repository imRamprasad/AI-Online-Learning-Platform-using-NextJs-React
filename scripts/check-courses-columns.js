#!/usr/bin/env node
// Quick script to inspect the `courses` table columns and row count using Neon client.
// Usage: set DATABASE_URL in your environment (or run with env var) and run:
// node scripts/check-courses-columns.js

(async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('ERROR: DATABASE_URL not set in environment.');
      process.exit(1);
    }

    const { neon } = await import('@neondatabase/serverless');
    const client = neon(DATABASE_URL);

    console.log('Connected to DB. Running schema checks...');

    const colsRes = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position;`
    );

    console.log('\ncourses table columns:');
    if (Array.isArray(colsRes?.rows) && colsRes.rows.length) {
      colsRes.rows.forEach((r) => console.log(`- ${r.column_name} (${r.data_type})`));
    } else if (Array.isArray(colsRes)) {
      // some client variants return array directly
      colsRes.forEach((r) => console.log(`- ${r.column_name} (${r.data_type})`));
    } else {
      console.log('No columns returned or unknown response format:', colsRes);
    }

    try {
      const countRes = await client.query(`SELECT count(*)::int AS cnt FROM courses;`);
      const cnt = Array.isArray(countRes?.rows) ? countRes.rows[0].cnt : countRes?.rows?.[0]?.cnt ?? (Array.isArray(countRes) ? countRes[0].cnt : null);
      console.log('\ncourses row count:', cnt);
    } catch (e) {
      console.warn('Could not run count query (table may not exist):', String(e));
    }

    // close client if available
    if (typeof client.end === 'function') {
      await client.end();
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal error running check:', err);
    process.exit(2);
  }
})();
