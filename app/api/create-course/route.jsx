"use server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, level, category } = await req.json();

    // Generate a unique course ID
    const cid = uuidv4();

    const course = await db
      .insert(coursesTable)
      .values({
        cid,
        name,
        description,
        level,
        category,
        numberOfChapters: 0,
        includeVideo: false,
        userEmail: userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: course[0] });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}