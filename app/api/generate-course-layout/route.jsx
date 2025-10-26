import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { v4 as uuidv4 } from "uuid";

// --- Prompt Template ---
const PROMPT = `
Generate a Learning Course based on the following details. Make sure to include:
- Course Name
- Description
- Category
- Level
- Include Video (boolean)
- Number of Chapters
- Banner Image Prompt: (modern, flat-style 2D digital illustration...)
- Chapters with Chapter Name, Duration, and Topics.
Return only valid JSON following this schema:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": ["string"]
      }
    ]
  }
}
`;

// --- Retry Helper Function ---
async function generateWithRetry(ai, model, contents, retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      return response;
    } catch (err) {
      if (err?.error?.status === "UNAVAILABLE" && i < retries - 1) {
        console.warn(`⚠️ Model overloaded, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// --- POST Route Handler ---
export async function POST(request) {
  try {
    const formData = await request.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = "gemini-2.5-flash";

    const contents = [
      {
        role: "user",
        parts: [{ text: PROMPT + JSON.stringify(formData) }],
      },
    ];

    // Generate AI Content
    const response = await generateWithRetry(ai, model, contents);
    let text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No content generated from Gemini");

    // Clean and parse JSON
    text = text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text }; // fallback
    }

    const courseJsonValue =
      parsed && typeof parsed === "object" ? parsed.course || parsed : { raw: text };

    // --- Insert into Database ---
    const [created] = await db
      .insert(coursesTable)
      .values({
        cid: uuidv4(),
        name: courseJsonValue.name || formData.name || "Untitled Course",
        description:
          courseJsonValue.description || formData.description || "No description provided",
        numberOfChapters:
          courseJsonValue.noOfChapters || formData.numberOfChapters || 0,
        includeVideo:
          typeof courseJsonValue.includeVideo === "boolean"
            ? courseJsonValue.includeVideo
            : false,
        level: courseJsonValue.level || formData.level || "Beginner",
        category: courseJsonValue.category || formData.category || "General",
        courseJson: courseJsonValue,
        userEmail: user?.primaryEmailAddress?.emailAddress,
      })
      .returning();

    return NextResponse.json({ success: true, created }, { status: 201 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
