"use client";

/**
 * Calculate the progress percentage for a course
 */
export function calculateCourseProgress(course, completedChapters = {}) {
  if (!course?.courseContent?.chapters?.length) return 0;
  
  const totalChapters = course.courseContent.chapters.length;
  const completed = Object.values(completedChapters || {}).filter(Boolean).length;
  
  return Math.round((completed / totalChapters) * 100);
}

/**
 * Format duration from minutes to readable string
 */
export function formatDuration(minutes) {
  if (!minutes) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Get the next incomplete chapter
 */
export function getNextIncompleteChapter(course, completedChapters = {}) {
  if (!course?.courseContent?.chapters?.length) return null;
  
  return course.courseContent.chapters.find(
    chapter => !completedChapters[chapter.id]
  );
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get course completion status text
 */
export function getCourseStatusText(progress) {
  if (progress === 100) return 'Completed';
  if (progress > 0) return 'In Progress';
  return 'Not Started';
}

/**
 * Get status color class
 */
export function getStatusColorClass(progress) {
  if (progress === 100) return 'text-green-600';
  if (progress > 0) return 'text-blue-600';
  return 'text-gray-600';
}

/**
 * Get fallback image URL for courses
 * @param {string} title - Course title to generate unique image
 * @param {string} [type='course'] - Type of image (course, avatar, etc.)
 * @returns {string} Fallback image URL
 */
export function getFallbackImage(title = '', type = 'course') {
  // Ensure we have a string to work with
  const text = title || 'Course';
  
  // Generate a deterministic background color based on the title
  const hash = text.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Create a pastel background color
  const h = Math.abs(hash) % 360;
  const s = 70; // Saturation percentage
  const l = 80; // Lightness percentage
  
  const dimensions = type === 'course' ? '1280x720' : '400x400';
  
  // Use placeholder.com to generate a placeholder image
  return `https://placehold.co/${dimensions}/hsl(${h},${s}%,${l}%)/333333?text=${encodeURIComponent(text)}`;
}