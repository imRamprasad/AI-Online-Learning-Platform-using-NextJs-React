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
Please ensure the videoId is a valid YouTube video ID for the chapter.


Now generate content for the chapter: "${chapterName}"
`;

// --- Retry Helper ---
async function generateWithRetry(ai, model, contents, retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      return response;
    } catch (err) {
      console.error(`❌ Error during Gemini API call (retry ${i + 1}/${retries}):`, err.message);
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

async function fetchYoutubeVideoId(query) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/youtube-search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`YouTube search failed: ${response.statusText}`);
    }
    const data = await response.json();
    if (data && data.length > 0) {
      const videoId = data[0].id.videoId;
      const title = data[0].snippet.title;
      const thumbnailUrl = data[0].snippet.thumbnails.default.url;
      return {
        videoId: videoId,
        videoWatchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: title,
        thumbnailUrl: thumbnailUrl,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching YouTube video ID:", error);
    return null;
  }
}

// --- POST Route ---
export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();
    console.log("Processing request for course:", courseTitle);

    if (!courseJson?.chapters || !Array.isArray(courseJson.chapters)) {
      return NextResponse.json({ error: "Invalid course data" }, { status: 400 });
    }

    // Initialize Gemini
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error("❌ GOOGLE_AI_API_KEY is not configured.");
      return NextResponse.json(
        { error: "Google AI API Key is not configured." },
        { status: 500 }
      );
    }
    console.log("Found GOOGLE_AI_API_KEY");
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";

    const promises = courseJson.chapters.map(async (chapter) => {
      console.log("Calling Gemini API for chapter:", chapter.chapterName);
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
      console.log("Gemini API response:", response);
      let rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Raw text from Gemini:", rawText);

      if (!rawText) {
        console.error(`❌ Gemini API returned no text content for chapter: ${chapter.chapterName}`);
        throw new Error(`Gemini API returned no text content for chapter: ${chapter.chapterName}`);
      }

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

      const youtubeQuery = `${chapter.chapterName} tutorial`;
      const videoData = await fetchYoutubeVideoId(youtubeQuery);
      if (videoData) {
        parsedJson.videoId = videoData.videoId;
        parsedJson.videoWatchUrl = videoData.videoWatchUrl;
        parsedJson.videoTitle = videoData.title;
        parsedJson.videoThumbnailUrl = videoData.thumbnailUrl;
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
