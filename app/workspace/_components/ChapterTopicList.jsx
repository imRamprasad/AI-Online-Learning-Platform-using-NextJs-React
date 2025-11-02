"use client";

import React from "react";
import { Gift } from "lucide-react";

function ChapterTopicList({ courseLayout }) {
  // Defensive: ensure chapters is an array
  const chapters = Array.isArray(courseLayout?.chapters) ? courseLayout.chapters : [];

  if (chapters.length === 0) {
    return (
      <div className="flex items-center justify-center mt-10">
        <p className="text-gray-500">No chapters available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10 space-y-8">
      {chapters.map((chapter, chapterIndex) => (
        <div key={`chapter-${chapterIndex}`} className="flex flex-col items-center w-full max-w-3xl">
          <div className="p-4 border shadow rounded-xl bg-primary text-white w-full text-center">
            <h3 className="text-lg font-bold">Chapter {chapterIndex + 1}</h3>
            <p className="font-semibold text-md mt-1">{chapter.chapterName}</p>
            <div className="text-xs flex justify-between mt-2">
              <span>Duration: {chapter?.duration ?? "—"}</span>
              <span>No. Of Topics: {Array.isArray(chapter?.topics) ? chapter.topics.length : 0}</span>
            </div>
          </div>

          <div className="w-full mt-4">
            {Array.isArray(chapter.topics) && chapter.topics.length > 0 ? (
              chapter.topics.map((topic, topicIndex) => (
                <div key={`c${chapterIndex}-t${topicIndex}`} className="flex flex-col items-center">
                  <div className="h-8 bg-gray-300 w-1" />
                  <div className="flex items-center gap-6 w-full justify-center py-2">
                    <div className="flex-1 text-right pr-4">
                      {topicIndex % 2 === 0 ? <span className="max-w-xs inline-block">{topic}</span> : <span />}
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-center rounded-full bg-gray-300 text-gray-700 px-4 py-3">
                        {topicIndex + 1}
                      </div>
                    </div>

                    <div className="flex-1 text-left pl-4">
                      {topicIndex % 2 !== 0 ? <span className="max-w-xs inline-block">{topic}</span> : <span />}
                    </div>
                  </div>

                  {topicIndex === chapter.topics.length - 1 && (
                    <>
                      <div className="h-8 bg-gray-300 w-1 mt-2" />
                      <div className="flex items-center gap-5 mt-2">
                        <Gift className="rounded-full bg-gray-300 h-14 w-14 text-gray-700 p-3" />
                      </div>
                      <div className="h-8 bg-gray-300 w-1 mt-2" />
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No topics available</div>
            )}
          </div>
        </div>
      ))}

      <div className="p-4 border shadow rounded-xl bg-green-600 text-white">
        <h3 className="text-center">Finish</h3>
      </div>
    </div>
  );
}

export default ChapterTopicList;
