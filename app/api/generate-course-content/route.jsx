import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";

// --- PROMPT Template ---
const PROMPT = (chapterName) => `
Generate detailed educational HTML content for the given chapter and topics.
Respond strictly in JSON format only. Do NOT include extra explanations or markdown fences.

Schema:
{
  "chapterName": "${chapterName}",
  "topics": [
    {
      "topic": "<topic>",
      "content": "<h2>...</h2><p>...</p>"
    }
  ]
}

Now generate content for the chapter: "${chapterName}"
`;

// --- Retry Helper ---
async function generateWithRetry(ai, model, contents, retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      return response;
    } catch (err) {
      if (err?.error?.status === "UNAVAILABLE" && i < retries - 1) {
        console.warn(`⚠️ Model busy. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// --- Safe JSON Extractor ---
function extractJSON(text) {
  try {
    text = text.replace(/```json|```/gi, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      text = text.substring(start, end + 1);
    }
    return JSON.parse(text);
  } catch (err) {
    console.warn("⚠️ JSON extraction failed:", err.message);
    return null;
  }
}

// --- POST Route ---
export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();

    if (!courseJson?.chapters || !Array.isArray(courseJson.chapters)) {
      return NextResponse.json({ error: "Invalid course data" }, { status: 400 });
    }

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = "gemini-2.5-flash";

    const promises = courseJson.chapters.map(async (chapter) => {
      const contents = [
        {
          role: "user",
          parts: [
            {
              text:
                PROMPT(chapter.chapterName) +
                "\nTopics:\n" +
                JSON.stringify(chapter.topics, null, 2),
            },
          ],
        },
      ];

      const response = await generateWithRetry(ai, model, contents);
      let rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const parsedJson = extractJSON(rawText);

      if (!parsedJson) {
        console.warn(`⚠️ Failed to parse JSON for chapter: ${chapter.chapterName}`);
        return {
          chapterName: chapter.chapterName,
          topics: chapter.topics.map((t) => ({
            topic: t,
            content: `<h2>${t}</h2><p>Content unavailable.</p>`,
          })),
        };
      }

      return parsedJson;
    });

    const CourseContent = await Promise.all(promises);

    // ✅ Save generated content to DB
    await db
      .update(coursesTable)
      .set({ coursesContent: CourseContent })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      success: true,
      courseName: courseTitle,
      courseId,
      CourseContent,
    });
  } catch (error) {
    console.error("❌ Error generating course content:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
