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

    const deleteSql = `DELETE FROM public.courses WHERE cid = $1;`;
    const cidToDelete = 'test-cid-1';

    console.log(`Deleting test course with cid: ${cidToDelete}...`);
    const res = await client.query(deleteSql, [cidToDelete]);
    console.log('Delete result:', res);

    // Also delete the test user if no other courses are associated with them
    const userEmailToDelete = 'test@example.com';
    const remainingCourses = await client.query(`SELECT count(*) FROM public.courses WHERE "userEmail" = $1;`, [userEmailToDelete]);
    if (remainingCourses.rows[0].count === '0') {
      console.log(`Deleting test user with email: ${userEmailToDelete}...`);
      await client.query(`DELETE FROM public.users WHERE email = $1;`, [userEmailToDelete]);
      console.log('Test user deleted.');
    } else {
      console.log(`Test user ${userEmailToDelete} still has associated courses, not deleting.`);
    }

    if (typeof client.end === 'function') await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Delete test failed:', err);
    process.exit(2);
  }
})();
