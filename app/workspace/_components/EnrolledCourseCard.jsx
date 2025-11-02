"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { LoaderCircle, BookOpen, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function EnrollCourseList() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch enrolled courses
  const GetEnrolledCourse = async () => {
    try {
      const result = await axios.get("/api/enroll-course");
      console.log("Enrolled Courses:", result.data);
      setEnrolledCourses(result.data || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast.error("❌ Failed to load enrolled courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetEnrolledCourse();
  }, []);

  // ✅ Calculate progress %
  const calculateProgress = (course) => {
    const completed = course?.completedChapters
      ? Object.keys(course.completedChapters).length
      : 0;
    const total = course?.numberOfChapters || 1;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-indigo-600 mb-4">
        🎓 My Enrolled Courses
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-600">
          <LoaderCircle className="animate-spin mr-2" size={20} />
          Loading enrolled courses...
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <AlertTriangle size={32} className="text-orange-400 mb-2" />
          <p className="text-sm">You haven't enrolled in any course yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {enrolledCourses.map((course, index) => {
            const progress = calculateProgress(course);

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Course Banner */}
                <div className="relative h-[120px] w-full">
                  {(() => {
                    const rawSrc =
                      course?.bannerImageURL ||
                      `https://via.placeholder.com/400x200?text=${encodeURIComponent(
                        course?.name || 'Course Banner'
                      )}`;
                    const isExternal = /^https?:\/\//i.test(rawSrc);

                    return (
                      <Image
                        src={rawSrc}
                        alt={course?.name || 'Course'}
                        fill
                        className="object-cover"
                        unoptimized={isExternal}
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <h2 className="font-semibold text-sm text-gray-800 truncate">
                    {course?.name || "Untitled Course"}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {course?.description || "No description available."}
                  </p>

                  <div className="flex items-center text-xs text-gray-600 gap-2 mt-2">
                    <BookOpen size={13} className="text-indigo-500" />
                    {course?.numberOfChapters || 0} Chapters
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {progress}% completed
                    </p>
                  </div>

                  {/* Continue Button */}
                  <Link
                    href={`/course/${course?.cid}`}
                    className="mt-3 block text-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                  >
                    {progress === 100 ? "✅ Completed" : "Continue Course"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EnrollCourseList;
