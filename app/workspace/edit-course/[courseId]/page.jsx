"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseInfo from "../components/CourseInfo";
import ChapterTopicList from "../../_components/ChapterTopicList";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

function EditCourse() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [generatingContent, setGeneratingContent] = useState(false);

  // ✅ Fetch course details from API
  const GetCourseInfo = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching course with ID:", courseId);
      const result = await axios.get(`/api/courses/${courseId}`);
      if (!result.data) {
        setError("Course not found.");
        setCourse(null);
      } else {
        setCourse(result.data);
      }
    } catch (err) {
      console.error("❌ Error fetching course:", err);
      setError("Failed to fetch course. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const generateCourseContent = async () => {
    if (!course) {
      toast.error("Course data is not loaded yet. Please wait.");
      return;
    }

    try {
      setGeneratingContent(true);

      // Generate course layout
      const layoutResponse = await axios.post("/api/generate-course-layout", {
        name: course.name,
        description: course.description,
        category: course.category,
        level: course.level,
        courseId: courseId // Pass courseId to the API
      });

      console.log("layoutResponse.data:", layoutResponse.data);
      console.log("layoutResponse.data.created:", layoutResponse.data.created);
      console.log("layoutResponse.data.created.courseJson:", layoutResponse.data.created.courseJson);
      const chapters = layoutResponse.data.created.courseJson.chapters;

      // Update course with generated content
      // Now generate content for each chapter
      const contentResponse = await axios.post("/api/generate-course-content", {
        courseJson: layoutResponse.data.created.courseJson, // Use the courseJson from layoutResponse
        courseTitle: course.name,
        courseId: courseId,
      });

      console.log("✅ Generated course content:", contentResponse.data);
      toast.success("Course content generated successfully!");
      // router.refresh(); // Removed router.refresh()
      router.push(`/workspace/view-course/${courseId}`); // Redirect to view course page
    } catch (error) {
      console.error("Failed to generate course content:", error);
      toast.error("Failed to generate course content. Please try again.");
    } finally {
      setGeneratingContent(false);
    }
  };

  useEffect(() => {
    if (courseId) GetCourseInfo();
  }, [courseId]);

  // ✅ Render UI
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {loading && (
        <p className="text-gray-600 text-center animate-pulse">
          Loading course details...
        </p>
      )}

      {!loading && error && (
        <p className="text-center text-red-500 font-medium">{error}</p>
      )}

      {!loading && course && (
        <>
          {/* ✅ Course Details Card */}
          <CourseInfo course={course} />

          {/* AI Generation Button */}
          <div className="flex justify-end">
            <Button
              onClick={generateCourseContent}
              disabled={generatingContent}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              {generatingContent ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>

          {/* ✅ Chapters + Topics Section */}
          {(() => {
            try {
              const courseLayout = course?.courseJson; // Directly use course.courseJson

              return (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Course Chapters & Topics
                  </h3>
                  <ChapterTopicList courseLayout={courseLayout} />
                </div>
              );
            } catch (e) {
              console.error(
                "❌ Failed to parse course.courseJson for ChapterTopicList:",
                e
              );
              return (
                <p className="text-center text-yellow-600 mt-4">
                  ⚠️ Unable to load chapters — course data corrupted.
                </p>
              );
            }
          })()}
        </>
      )}
    </div>
  );
}

export default EditCourse;
