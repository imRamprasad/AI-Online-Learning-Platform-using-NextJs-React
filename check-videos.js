// Load environment variables
require('dotenv').config();

// Import dependencies
const { neon } = require('@neondatabase/serverless');
const axios = require('axios');

async function isYouTubeVideoAvailable(videoId) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    console.error('⚠️ YouTube API key is not configured.');
    return false;
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoId}&part=status`;

  try {
    const response = await axios.get(url);
    if (response.data.items && response.data.items.length > 0) {
      const status = response.data.items[0].status;
      // A video is considered available if it's public and embeddable
      return status.privacyStatus === 'public' && status.embeddable;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error checking YouTube video availability for ${videoId}:`, error.message);
    return false;
  }
}

/**
 * ✅ Finds a relevant YouTube video for a given query.
 * @param {string} query The search query (e.g., chapter name).
 * @returns {Promise<string|null>} The URL of the first video found, or null.
 */
async function findYouTubeVideo(query) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    console.error('⚠️ YouTube API key is not configured.');
    return null;
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(
    query
  )}&type=video&part=snippet&maxResults=1`;

  try {
    const response = await axios.get(url);
    if (response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching from YouTube API:', error.message);
    return null;
  }
}

/**
 * ✅ Main function: Fetches courses, and finds missing video URLs.
 */
async function checkVideosFixed() {
  // Create Neon client
  const client = neon(process.env.DATABASE_URL);

  try {
    console.log('🔗 Connecting to database and fetching courses...');
    const res = await client.query(
      'SELECT cid, name, "courseJson" FROM courses WHERE "courseJson"->>\'chapters\' IS NOT NULL LIMIT 3;'
    );

    if (!res.length) {
      console.log('⚠️ No courses found with chapters.');
      return;
    }

    console.log(`📚 Found ${res.length} course(s) with chapters.\n`);

    for (const row of res) {
      console.log(`📘 Course: ${row.name} (CID: ${row.cid})`);

      let parsedCourseJson;
      try {
        parsedCourseJson =
          typeof row.courseJson === 'string'
            ? JSON.parse(row.courseJson)
            : row.courseJson;
      } catch (jsonErr) {
        console.error(`⚠️ Failed to parse JSON for course: ${row.name}`);
        console.error(jsonErr.message);
        continue;
      }

      if (!parsedCourseJson?.chapters || !Array.isArray(parsedCourseJson.chapters)) {
        console.log(`  🚫 No valid chapters found for this course.`);
        console.log('---');
        continue;
      }

      let courseUpdated = false;

      for (const [i, ch] of parsedCourseJson.chapters.entries()) {
        console.log(`  🎬 Chapter ${i + 1}: ${ch.chapterName || 'Untitled'}`);

        let currentVideoId = null;
        if (ch.videoWatchUrl) {
          const match = ch.videoWatchUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
          currentVideoId = match ? match[1] : null;
        }

        let videoNeedsUpdate = false;
        if (currentVideoId) {
          const available = await isYouTubeVideoAvailable(currentVideoId);
          if (!available) {
            console.log(`    ❌ Existing video ${ch.videoWatchUrl} is unavailable. Searching for a new one...`);
            videoNeedsUpdate = true;
          }
        } else if (!ch.videoWatchUrl) {
          console.log(`    ⚠️ No video URL found. Searching on YouTube...`);
          videoNeedsUpdate = true;
        }

        if (videoNeedsUpdate) {
          const newVideoWatchUrl = await findYouTubeVideo((ch.chapterName ? ch.chapterName + ' ' : '') + row.name);

          if (newVideoWatchUrl) {
            const newVideoIdMatch = newVideoWatchUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
            const newVideoId = newVideoIdMatch ? newVideoIdMatch[1] : null;

            if (newVideoId) {
              console.log(`    ✅ Found new video: ${newVideoWatchUrl}`);
              ch.videoWatchUrl = newVideoWatchUrl;
              ch.videoUrl = `https://www.youtube.com/embed/${newVideoId}?rel=0&modestbranding=1`;
              courseUpdated = true;
            } else {
              console.log(`    ❌ Could not extract video ID from new URL: ${newVideoWatchUrl}`);
            }
          } else {
            console.log(`    ❌ No new video found for "${ch.chapterName || row.name}".`);
          }
        }
      }

      if (courseUpdated) {
        console.log(`
  💾 Saving updated course content to the database...`);
        try {
          await client.query(
            'UPDATE courses SET "courseJson" = $1 WHERE cid = $2;',
            [JSON.stringify(parsedCourseJson), row.cid]
          );
          console.log(`  ✅ Successfully updated course: ${row.name}`);
        } catch (updateErr) {
          console.error(`  ❌ Failed to update course: ${row.name}`);
          console.error(updateErr.message);
        }
      }

      console.log('---');
    }
  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    console.log('✅ Done checking videos.\n');
  }
}

// If run directly, execute checkVideosFixed()
if (require.main === module) {
  checkVideosFixed();
}
