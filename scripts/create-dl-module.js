const axios = require('axios');

const courseData = {
  name: "Computer Hardware Basics",
  description: "An introductory course on the basic components of a computer.",
  noOfChapters: 5,
  includeVideo: false,
  level: "Beginner",
  category: "Digital Literacy",
};

async function createDigitalLiteracyModule() {
  try {
    const response = await axios.post('http://localhost:3000/api/generate-course-layout', courseData, {
      headers: {
        // This is a placeholder. In a real application, you would need to
        // get a valid session token for an authenticated user.
        'Authorization': 'Bearer dummy-token'
      }
    });
    console.log('Successfully created digital literacy module:', response.data);
  } catch (error) {
    console.error('Error creating digital literacy module:', error.response ? error.response.data : error.message);
  }
}

createDigitalLiteracyModule();