import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

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
        "topics": ["string"],
        "videoUrl": "string" // URL of the video for this chapter
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

// --- Image Generation Function ---
const GenerateImage = async (ImagePrompt) => {
  try {
    const BASE_URL = "https://aigurulab.tech";
    const result = await axios.post(
      `${BASE_URL}/api/generate-image`,
      {
        width: 1024,
        height: 1024,
        input: ImagePrompt,
        model: "flux", // or "flux"
        aspectRatio: "16:9",
      },
      {
        headers: {
          "x-api-key": process.env.AI_GURU_LAB_API, // your API key
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Banner generated");
    // The upstream service may return either a full URL or a raw base64 string.
    // Normalize to a data URI when we detect base64 so `next/image` can render it
    // without requiring remote domain configuration.
    const image = result.data.image;
    if (!image) return null;

    // Heuristic: if the string is long and looks like base64 (only base64 chars),
    // treat it as raw base64 and prefix a PNG data URI. Otherwise return as-is.
    const base64Like = typeof image === "string" && /^[A-Za-z0-9+/=\s]+$/.test(image) && image.length > 200;
    if (base64Like) {
      // Remove any whitespace/newlines that may be in the payload
      const cleaned = image.replace(/\s+/g, "");
      return `data:image/png;base64,${cleaned}`;
    }

    return image; // URL
  } catch (err) {
    console.error("❌ Image generation failed:", err.message);
    return null;
  }
};

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

    // --- Generate AI Content ---
    const response = await generateWithRetry(ai, model, contents);
    let text = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No content generated from Gemini");

    // --- Clean and parse JSON ---
    text = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text }; // fallback if Gemini gives invalid JSON
    }

    const courseJsonValue =
      parsed && typeof parsed === "object" ? parsed.course || parsed : { raw: text };

    // --- Generate Banner Image ---
    const ImagePrompt =
      courseJsonValue.bannerImagePrompt ||
      "modern flat-style 2D digital illustration for online learning course";
    const bannerImageURL = await GenerateImage(ImagePrompt);

    // --- Insert into Database ---
    const [created] = await db
      .insert(coursesTable)
      .values({
        cid: uuidv4(),
        name: courseJsonValue.name || formData.name || "Untitled Course",
        description:
          courseJsonValue.description ||
          formData.description ||
          "No description provided",
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
        bannerImageURL: bannerImageURL || null,
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
