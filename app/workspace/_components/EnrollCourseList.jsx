"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { LoaderCircle, BookOpen, AlertTriangle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

// Create a ref to store the refresh function
let refreshEnrolledCoursesRef = null;

function EnrollCourseList() {
  const { getToken } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch enrolled courses from backend
  const fetchEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const response = await axios.get("/api/user/enrolled-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allEnrolledCourses = response.data || [];
      const filtered = allEnrolledCourses.filter(enrollment => enrollment.cid !== 'test-cid-1');
      setEnrolledCourses(filtered);
    } catch (error) {
      console.error("❌ Error fetching enrolled courses:", error);
      toast.error("Failed to load enrolled courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();

    // Store the refresh function in the ref for external access
    refreshEnrolledCoursesRef = fetchEnrolledCourses;

    // Refresh enrolled courses list every 30 seconds
    const intervalId = setInterval(fetchEnrolledCourses, 30000);

    // ✅ Refresh data when window regains focus (e.g., after navigating back)
    const handleFocus = () => {
      fetchEnrolledCourses();
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup interval, ref, and event listener on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      refreshEnrolledCoursesRef = null;
    };
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        🎓 My Enrolled Courses
      </h1>

      {/* 🔄 Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <LoaderCircle className="animate-spin mb-3" size={32} />
          <p>Loading your enrolled courses...</p>
        </div>
      ) : enrolledCourses.length === 0 ? (
        // ⚠️ Empty State
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <AlertTriangle size={36} className="text-orange-400 mb-3" />
          <p className="text-sm">You haven’t enrolled in any courses yet.</p>
        </div>
      ) : (
        // 📚 Enrolled Courses Grid
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {enrolledCourses.map((enrollment) => {
            return (
              <div
                key={enrollment.cid}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-200 transition-transform hover:scale-[1.02]"
              >
                {/* Course Banner */}
                <div className="relative h-[140px] w-full">
                  <Image
                    src={
                      enrollment?.bannerImageURL ||
                      `https://placehold.co/400x200?text=${encodeURIComponent(
                        enrollment?.name || 'Course Banner'
                      )}`
                    }
                    alt={enrollment?.name || 'Course'}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 text-sm truncate">
                    {enrollment?.name || "Untitled Course"}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {enrollment?.description || "No description available."}
                  </p>

                  <div className="flex items-center text-xs text-gray-600 gap-2 mt-3">
                    <BookOpen size={14} className="text-indigo-500" />
                    <span>{enrollment?.numberOfChapters || 0} Chapters</span>
                  </div>

                  <Link 
                    href={`/workspace/view-course/${enrollment?.cid}`}
                    className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <PlayCircle size={14} />
                    Continue Learning
                  </Link>

                  {/* 📊 Progress Bar Section */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {enrollment.progress > 0 ? `${enrollment.progress}%` : "Not Started"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
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
