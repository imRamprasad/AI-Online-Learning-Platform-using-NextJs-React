import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm"; // ✅ added desc
import { currentUser } from "@clerk/nextjs/server"; // ✅ correct import

export async function GET(req) {
  try {

    const user = await currentUser(); // ✅ must be awaited

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // ✅ Fetch courses for the current user (ordered by latest)
    const result = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userEmail, userEmail))
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
