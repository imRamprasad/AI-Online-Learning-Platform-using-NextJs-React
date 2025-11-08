require('dotenv').config({ path: '.env.local' });

(async () => {
  const courseId = process.argv[2] || '4973c5bb-40fc-4dd3-b779-e1ee6371d5bc';

  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('ERROR: DATABASE_URL not set. Make sure .env.local file is configured.');
      process.exit(1);
    }
    const { neon } = await import('@neondatabase/serverless');
    const client = neon(DATABASE_URL);

    console.log(`Fetching course data for course ID: ${courseId}...`);

    // Fetch the course data
    const res = await client.query(`SELECT "courseJson" FROM public.courses WHERE "cid" = $1`, [courseId]);
    const course = Array.isArray(res) ? res[0] : (res?.rows?.[0] || null);

    if (!course || !course.courseJson) {
      console.error('ERROR: Course not found or courseJson is empty.');
      process.exit(1);
    }

    console.log('Course JSON:');
    console.log(JSON.stringify(course.courseJson, null, 2));

    if (typeof client.end === 'function') await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Script failed:', err);
    process.exit(2);
  }
})();
