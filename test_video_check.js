require('dotenv').config();
const axios = require('axios');

async function checkVideoAccessibility(videoUrl) {
  try {
    // Use a HEAD request to check accessibility without downloading the full video
    const response = await axios.head(videoUrl, { timeout: 5000 }); // 5-second timeout
    return response.status >= 200 && response.status < 300; // True for 2xx status codes
  } catch (error) {
    console.error(`Error checking ${videoUrl}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Running video accessibility tests...');

  // Test 1: Known accessible YouTube video
  const youtubeUrl1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Astley
  console.log(`Checking ${youtubeUrl1}...`);
  let isAccessible = await checkVideoAccessibility(youtubeUrl1);
  console.log(`Result: ${isAccessible ? 'Accessible' : 'Not Accessible'}`);

  // Test 2: Another known accessible YouTube video (short public domain)
  const youtubeUrl2 = 'https://www.youtube.com/watch?v=xvFZjo5PgG0';
  console.log(`Checking ${youtubeUrl2}...`);
  isAccessible = await checkVideoAccessibility(youtubeUrl2);
  console.log(`Result: ${isAccessible ? 'Accessible' : 'Not Accessible'}`);

  // Test 3: A non-existent URL
  const nonExistentUrl = 'https://www.example.com/non-existent-video';
  console.log(`Checking ${nonExistentUrl}...`);
  isAccessible = await checkVideoAccessibility(nonExistentUrl);
  console.log(`Result: ${isAccessible ? 'Accessible' : 'Not Accessible'}`);

  // Test 4: A valid website, but not a video
  const validWebsiteUrl = 'https://www.google.com';
  console.log(`Checking ${validWebsiteUrl}...`);
  isAccessible = await checkVideoAccessibility(validWebsiteUrl);
  console.log(`Result: ${isAccessible ? 'Accessible' : 'Not Accessible'}`);
}

runTests();
