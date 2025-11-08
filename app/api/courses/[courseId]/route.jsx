import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    const { courseId } = params;

    if (!userEmail || !courseId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Fetch the course
    const courseResult = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, courseId))
      .limit(1);

    if (courseResult.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseResult[0];

    // Check if user is enrolled in this course
    const enrollmentResult = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.cid, courseId),
          eq(enrollCourseTable.userEmail, userEmail)
        )
      )
      .limit(1);

    const isEnrolled = enrollmentResult.length > 0;
    const completedChapters = isEnrolled ? enrollmentResult[0].completedChapters || {} : {};

    console.log("Course being sent to client:", JSON.stringify({
      ...course,
      isEnrolled,
      completedChapters
    }, null, 2));

    return NextResponse.json({
      ...course,
      isEnrolled,
      completedChapters
    });

  } catch (error) {
    console.error("❌ Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course", details: error.message },
      { status: 500 }
    );
  }
}
