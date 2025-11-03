import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// GET: Fetch course details
export async function GET(req, { params }) {
  try {
    const { courseId } = await params;
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Get course details and enrollment status
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, courseId));

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is enrolled
    const [enrollment] = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.cid, courseId),
          eq(enrollCourseTable.userEmail, userEmail)
        )
      );

    return NextResponse.json({
      ...course,
      isEnrolled: !!enrollment,
      completedChapters: enrollment?.completedChapters || {},
    });
  } catch (error) {
    console.error("❌ Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { courseId } = await params;
    const user = await currentUser();
    const { name, description, level, category } = await req.json();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const [updatedCourse] = await db
      .update(coursesTable)
      .set({
        name,
        description,
        level,
        category,
      })
      .where(eq(coursesTable.cid, courseId))
      .returning();

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("❌ Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course", details: error.message },
      { status: 500 }
    );
  }
}