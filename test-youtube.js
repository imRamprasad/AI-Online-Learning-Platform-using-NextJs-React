const axios = require('axios');
require('dotenv').config();

async function testYouTubeAPI() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    console.log('YouTube API key not set');
    return;
  }

  const query = 'javascript tutorial';
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const videoId = response.data.items[0]?.id?.videoId;
    console.log('Test YouTube search result:', videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'No video found');
  } catch (err) {
    console.log('YouTube API test failed:', err.response?.data?.error?.message || err.message);
  }
}

testYouTubeAPI();
