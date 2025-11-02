import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ POST: Enroll in a course
export async function POST(req) {
  try {
    const { courseId } = await req.json();
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to enroll in courses" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // ✅ Check if course exists
    const course = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, courseId));

    if (course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // ✅ Check if already enrolled
    const enrollCourses = await db
      .select()
      .from(enrollCourseTable)
      .where(and(
        eq(enrollCourseTable.userEmail, userEmail), 
        eq(enrollCourseTable.cid, courseId)
      ));

    if (enrollCourses.length === 0) {
      // ✅ Insert enrollment with default completed chapters
      const result = await db
        .insert(enrollCourseTable)
        .values({
          cid: courseId,
          userEmail,
          completedChapters: {} // Initialize empty completed chapters
        })
        .returning();

      return NextResponse.json({ 
        success: true, 
        data: result,
        message: "Successfully enrolled in the course"
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "Already Enrolled",
      data: enrollCourses[0]
    });
  } catch (error) {
    console.error("❌ Enrollment Error:", error);
    return NextResponse.json(
      { error: "Enrollment failed", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET: Fetch enrolled courses for current user
export async function GET(req) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    // ✅ Join enrolled courses with course details
    const result = await db
      .select()
      .from(enrollCourseTable)
      .innerJoin(coursesTable, eq(enrollCourseTable.cid, coursesTable.cid))
      .where(eq(enrollCourseTable.userEmail, userEmail))
      .orderBy(desc(enrollCourseTable.id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ GET /api/enroll-course Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled courses", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ PATCH: Update course progress
export async function PATCH(req) {
  try {
    const { courseId, completedChapters } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Update completed chapters
    const result = await db
      .update(enrollCourseTable)
      .set({
        completedChapters
      })
      .where(
        and(
          eq(enrollCourseTable.cid, courseId),
          eq(enrollCourseTable.userEmail, userEmail)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      data: result,
      message: "Progress updated successfully"
    });
  } catch (error) {
    console.error("❌ PATCH /api/enroll-course Error:", error);
    return NextResponse.json(
      { error: "Failed to update progress", details: error.message },
      { status: 500 }
    );
  }
}
