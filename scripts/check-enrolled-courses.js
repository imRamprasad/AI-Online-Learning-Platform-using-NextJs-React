require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('ERROR: DATABASE_URL not set. Make sure .env.local file is configured.');
      process.exit(1);
    }
    const { neon } = await import('@neondatabase/serverless');
    const client = neon(DATABASE_URL);

    console.log('Fetching enrolled courses...');

    const selectSql = `SELECT * FROM public."enrollCourse";`;

    const res = await client.query(selectSql);

    const rows = Array.isArray(res) ? res : (res?.rows || []);

    if (rows.length > 0) {
      console.log('✅ Successfully fetched enrolled courses:');
      console.table(rows);
    } else {
      console.warn('⚠️ No enrolled courses found.');
    }

    if (typeof client.end === 'function') await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Script failed:', err);
    process.exit(2);
  }
})();
