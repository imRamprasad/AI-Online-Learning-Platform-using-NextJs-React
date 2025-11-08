const { isValidYouTubeUrl, checkVideoAccessibility } = require('./check-videos');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('isValidYouTubeUrl', () => {
  test('should return true for valid YouTube watch URLs', () => {
    expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isValidYouTubeUrl('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    expect(isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    expect(isValidYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  });

  test('should return false for invalid YouTube URLs', () => {
    expect(isValidYouTubeUrl('https://www.google.com')).toBe(false);
    expect(isValidYouTubeUrl('https://www.youtube.com/not-a-video')).toBe(false);
    expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=short')).toBe(false); // Too short ID
    expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=tooLongVideoId123')).toBe(false); // Too long ID
    expect(isValidYouTubeUrl('invalid-url')).toBe(false);
    expect(isValidYouTubeUrl('')).toBe(false);
    expect(isValidYouTubeUrl(null)).toBe(false);
    expect(isValidYouTubeUrl(undefined)).toBe(false);
  });
});

describe('checkVideoAccessibility', () => {
  test('should return true if HEAD request is successful (2xx status)', async () => {
    axios.head.mockResolvedValueOnce({ status: 200 });
    await expect(checkVideoAccessibility('https://www.youtube.com/watch?v=valid')).resolves.toBe(true);

    axios.head.mockResolvedValueOnce({ status: 204 });
    await expect(checkVideoAccessibility('https://www.youtube.com/watch?v=anotherValid')).resolves.toBe(true);
  });

  test('should return false if HEAD request returns non-2xx status', async () => {
    axios.head.mockResolvedValueOnce({ status: 404 });
    await expect(checkVideoAccessibility('https://www.youtube.com/watch?v=notFound')).resolves.toBe(false);

    axios.head.mockResolvedValueOnce({ status: 500 });
    await expect(checkVideoAccessibility('https://www.youtube.com/watch?v=serverError')).resolves.toBe(false);
  });

  test('should return false if HEAD request throws an error', async () => {
    axios.head.mockRejectedValueOnce(new Error('Network error'));
    await expect(checkVideoAccessibility('https://www.youtube.com/watch?v=networkError')).resolves.toBe(false);

    axios.head.mockRejectedValueOnce({ response: { status: 403 } }); // Axios error structure
    await expect(checkVideoAccessibility('https://www.youtube.com/watch?v=forbidden')).resolves.toBe(false);
  });
});
