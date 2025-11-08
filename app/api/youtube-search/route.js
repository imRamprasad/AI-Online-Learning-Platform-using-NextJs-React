
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key is not configured" },
      { status: 500 }
    );
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${q}&type=video&part=snippet&maxResults=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data.items);
    } else {
      return NextResponse.json(
        { error: "Failed to fetch from YouTube API", details: data },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
