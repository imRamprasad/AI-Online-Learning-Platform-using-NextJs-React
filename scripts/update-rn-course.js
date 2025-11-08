
require('dotenv').config({ path: '.env.local' });

(async () => {
  const courseId = '4973c5bb-40fc-4dd3-b779-e1ee6371d5bc';
  const newVideoId = 'xN_Kq_WE-oI'; // React Native in 100 Seconds by Fireship

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
    const [course] = await client.query(`SELECT "courseJson" FROM public.courses WHERE "cid" = $1`, [courseId]);

    if (!course || !course.courseJson) {
      console.error('ERROR: Course not found or courseJson is empty.');
      process.exit(1);
    }

    const courseData = course.courseJson;

    // Find the chapter and update the videoId
    let chapterUpdated = false;
    if (courseData.chapters && courseData.chapters.length > 0) {
      for (const chapter of courseData.chapters) {
        if (chapter.topics && chapter.topics.includes('What is React.js and why use it?')) {
          chapter.videoId = newVideoId;
          chapterUpdated = true;
          console.log(`Chapter "${chapter.chapterName}" updated with new video ID: ${newVideoId}`);
          break; // Assuming only one chapter needs update
        }
      }
    }

    if (!chapterUpdated) {
      console.warn('⚠️  Chapter with the specified topic not found. No updates were made.');
      process.exit(0);
    }

    // Update the course in the database
    console.log(`Updating course with ID: ${courseId}...`);
    const updateSql = `UPDATE public.courses SET "courseJson" = $1 WHERE "cid" = $2 RETURNING "cid", "name", "updatedAt";`;
    const values = [JSON.stringify(courseData), courseId];
    
    const res = await client.query(updateSql, values);
    
    const row = Array.isArray(res) ? res[0] : (res?.rows?.[0] || null);

    if (row) {
      console.log('✅ Successfully updated course:');
      console.log(row);
    } else {
      console.warn('⚠️ Course not found or not updated. No rows returned.');
    }

    if (typeof client.end === 'function') await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Update script failed:', err);
    process.exit(2);
  }
})();
