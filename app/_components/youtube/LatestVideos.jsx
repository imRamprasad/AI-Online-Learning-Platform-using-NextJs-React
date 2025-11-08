"use client";
import React, { useEffect, useState } from "react";

const API_KEY = "YOUR_YOUTUBE_API_KEY"; // 🔑 Replace with your key
const CHANNEL_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw"; // Example: Google Developers Channel
const MAX_RESULTS = 6;

function LatestVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}`
        );
        const data = await response.json();
        setVideos(data.items || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();

    const intervalId = setInterval(fetchVideos, 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  if (loading) return <p className="text-center">Loading latest videos...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Latest YouTube Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            className="bg-gray-800 p-4 rounded-2xl shadow-lg hover:scale-105 transform transition"
          >
            <a
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                className="rounded-xl mb-3"
              />
              <h2 className="text-lg font-semibold hover:text-red-400">
                {video.snippet.title}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LatestVideos;
