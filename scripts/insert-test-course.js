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

    const insertSql = `INSERT INTO public.courses ("cid", "name", "description", "numberOfChapters", "includeVideo", "level", "category", "courseJson", "userEmail")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;`;

    const values = [
      'test-cid-1',
      'Test Course (insert-test)',
      'This is a test row inserted by scripts/insert-test-course.js',
      1,
      false,
      'Beginner',
      'Testing',
      JSON.stringify({ test: true, insertedAt: new Date().toISOString() }),
      'test@example.com',
    ];

  // Ensure test user exists to satisfy FK to users.email
  const testEmail = 'test@example.com';
  await client.query(`INSERT INTO public.users ("name", "email") VALUES ($1,$2) ON CONFLICT (email) DO NOTHING;`, ['Test User', testEmail]);

  console.log('Inserting test course...');
  const res = await client.query(insertSql, values);
    // client returns different shapes; handle both
    const row = Array.isArray(res) ? res[0] : (res?.rows?.[0] || null);
    console.log('Insert result:', row);

    // Count rows
    try {
      const countRes = await client.query('SELECT count(*)::int as cnt FROM public.courses;');
      const cnt = Array.isArray(countRes) ? countRes[0].cnt : (countRes?.rows?.[0]?.cnt ?? null);
      console.log('courses row count:', cnt);
    } catch (e) {
      console.warn('Could not run count query:', String(e));
    }

    if (typeof client.end === 'function') await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Insert test failed:', err);
    process.exit(2);
  }
})();
