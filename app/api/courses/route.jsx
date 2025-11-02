import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm"; // ✅ added desc
import { currentUser } from "@clerk/nextjs/server"; // ✅ correct import

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const user = await currentUser(); // ✅ must be awaited

    // ✅ If no user found
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // ✅ If a courseId is provided — fetch single course
    if (courseId) {
      const result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseId));

      if (result.length === 0) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      console.log("✅ Single course fetched:", result[0]);
      return NextResponse.json(result[0]);
    }

    // ✅ Fetch all courses for current user (ordered by latest)
    const result = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userEmail, user.primaryEmailAddress.emailAddress))
      .orderBy(desc(coursesTable.id)); // ✅ fixed — removed the stray semicolon before .orderBy

    console.log("✅ User courses fetched:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course", details: error.message },
      { status: 500 }
    );
  }
}
