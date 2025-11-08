import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { enrollCourseTable, coursesTable } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    console.log("GET /api/user/enrolled-courses called for user:", userEmail);

    // Get enrolled courses with course details and progress from enrollCourseTable
    // Use left join to include enrollments even if course data is missing
    const enrolledCourses = await db
      .select({
        cid: enrollCourseTable.cid,
        name: coursesTable.name,
        description: coursesTable.description,
        level: coursesTable.level,
        category: coursesTable.category,
        numberOfChapters: coursesTable.numberOfChapters,
        includeVideo: coursesTable.includeVideo,
        bannerImageURL: coursesTable.bannerImageURL,
        completedChapters: enrollCourseTable.completedChapters,
      })
      .from(enrollCourseTable)
      .leftJoin(coursesTable, eq(enrollCourseTable.cid, coursesTable.cid))
      .where(eq(enrollCourseTable.userEmail, userEmail));

    // Calculate progress for each course based on completed chapters
    const coursesWithDetails = enrolledCourses.map(course => {
      const completedCount = course.completedChapters ? Object.keys(course.completedChapters).length : 0;
      const totalChapters = course.numberOfChapters || 1;
      const progress = Math.round((completedCount / totalChapters) * 100);

      return {
        ...course,
        progress: Math.min(progress, 100), // Cap at 100%
        estimatedTime: `${totalChapters * 15} min`, // Rough estimate
        nextChapter: progress < 100 ? {
          title: `Chapter ${completedCount + 1}`
        } : null,
        completedCount,
        totalChapters,
      };
    });

    return NextResponse.json(coursesWithDetails);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}
