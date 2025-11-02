"use client";
import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Book, LoaderCircle, PlayCircle, Settings, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function CourseCard({ course, isEnrolled: isEnrolledProp = false, onEnrollSuccess }) {
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(Boolean(isEnrolledProp));
  const [courseProgress, setCourseProgress] = useState(0);
  const [progressLoading, setProgressLoading] = useState(true);

  // Keep internal state in sync with parent-provided prop
  useEffect(() => {
    setIsEnrolled(Boolean(isEnrolledProp));
  }, [isEnrolledProp]);

  // Fetch this user's enrollment entry to determine progress for this course
  useEffect(() => {
    let mounted = true;
    const fetchProgress = async () => {
      try {
        setProgressLoading(true);
        const res = await axios.get('/api/enroll-course');
        const enrolled = res.data || [];
        const entry = enrolled.find(e => e.courses?.cid === course?.cid || e.cid === course?.cid);
        if (!mounted) return;
        if (entry) {
          const completed = entry.completedChapters ? Object.values(entry.completedChapters).filter(Boolean).length : 0;
          const total = course?.numberOfChapters || (course?.courseJson?.noOfChapters) || (course?.courseJson?.chapters?.length) || 0;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          setCourseProgress(pct);
        } else {
          setCourseProgress(0);
        }
      } catch (err) {
        console.error('Error fetching enrollment progress for course card', err);
      } finally {
        if (mounted) setProgressLoading(false);
      }
    };
    fetchProgress();
    return () => { mounted = false; };
  }, [course, isEnrolled]);

  // ✅ Enroll Course Handler
  const onEnrollCourse = async () => {
    try {
      setLoading(true);
      const result = await axios.post("/api/enroll-course", {
        courseId: course?.cid,
      });
      
      if (result.data.success) {
        toast.success("✅ Enrolled Successfully!");
        setIsEnrolled(true);
        // Inform parent so CourseList can update its enrolled set without full reload
        if (typeof onEnrollSuccess === 'function') onEnrollSuccess(course?.cid);
        // Refresh the enrolled courses list
        if (typeof refreshEnrolledCoursesRef === 'function') {
          refreshEnrolledCoursesRef();
        }
        // start with zero progress (will be updated if they click Start)
        setCourseProgress(0);
      }
    } catch (e) {
      console.error("Enrollment Error:", e);
      toast.error(e.response?.data?.error || "❌ Failed to enroll in the course");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Parse JSON safely
  const courseJson = useMemo(() => {
    try {
      if (!course?.courseJson) return null;
      return typeof course.courseJson === "string"
        ? JSON.parse(course.courseJson)
        : course.courseJson;
    } catch (err) {
      console.error("Error parsing course JSON:", err);
      return null;
    }
  }, [course]);

  // ✅ Image Fix (fallback to placeholder)

  // Click-to-start: mark first chapter complete (makes Not Started -> Started)
  const startCourse = async () => {
    try {
      setLoading(true);

      // Ensure enrollment
      if (!isEnrolled) {
        const enrollRes = await axios.post('/api/enroll-course', { courseId: course?.cid });
        if (enrollRes.data?.success) {
          setIsEnrolled(true);
          if (typeof onEnrollSuccess === 'function') onEnrollSuccess(course?.cid);
        }
      }

      // Fetch existing enrollment to get current completedChapters
      const listRes = await axios.get('/api/enroll-course');
      const enrolled = listRes.data || [];
      const entry = enrolled.find(e => e.courses?.cid === course?.cid || e.cid === course?.cid);
      const existing = (entry && entry.completedChapters) ? entry.completedChapters : {};

      // mark first chapter id. We'll use 'chapter-1' convention used elsewhere.
      const updated = { ...existing, ['chapter-1']: true };

      await axios.patch('/api/enroll-course', { courseId: course?.cid, completedChapters: updated });

      // update UI
      const total = course?.numberOfChapters || (course?.courseJson?.noOfChapters) || (course?.courseJson?.chapters?.length) || 0;
      const pct = total > 0 ? Math.round((Object.values(updated).filter(Boolean).length / total) * 100) : 0;
      setCourseProgress(pct);
      toast.success('Course started — progress updated');
      // Refresh the enrolled courses list to update progress
      if (typeof refreshEnrolledCoursesRef === 'function') {
        refreshEnrolledCoursesRef();
      }
    } catch (err) {
      console.error('Error starting course', err);
      toast.error('Failed to start course');
    } finally {
      setLoading(false);
    }
  };

  const bannerSrc =
    course?.bannerImageURL ||
    courseJson?.bannerImageURL ||
    `https://via.placeholder.com/400x200?text=${encodeURIComponent(course?.name || 'Course')}`;
  const isExternalBanner = /^https?:\/\//i.test(bannerSrc);

  // A course may store generated content in different fields depending on the API
  // - `courseContent` (legacy)
  // - `coursesContent` (used by generate-course-content)
  // - `courseJson.chapters` (if layout generation included chapters)
  const hasCourseContent = Boolean(
    (course?.courseContent && (Array.isArray(course.courseContent) ? course.courseContent.length > 0 : Object.keys(course.courseContent).length > 0)) ||
    (course?.coursesContent && (Array.isArray(course.coursesContent) ? course.coursesContent.length > 0 : Object.keys(course.coursesContent).length > 0)) ||
    (courseJson?.chapters && Array.isArray(courseJson.chapters) && courseJson.chapters.length > 0) ||
    (course?.courseJson && course.courseJson.chapters && course.courseJson.chapters.length > 0)
  );

  return (
    <div className="group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer w-[280px]">
      {/* ✅ Course Banner */}
      <div className="relative w-full h-[100px] overflow-hidden">
        <Image
          src={bannerSrc}
          alt={course?.name || courseJson?.name || "Course banner"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 280px"
          priority
          unoptimized={isExternalBanner}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* ✅ Course Info */}
      <div className="p-3 space-y-2">
        <h2 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
          {course?.name || courseJson?.name || "Untitled Course"}
        </h2>

        <p className="text-gray-600 text-xs line-clamp-2 leading-snug">
          {course?.description ||
            courseJson?.description ||
            "No description available."}
        </p>

        <div className="flex items-center text-xs text-gray-700 gap-2 mt-1">
          <Book size={13} className="text-indigo-500" />
          <span className="font-medium">
            {course?.numberOfChapters || courseJson?.noOfChapters || 0} Chapters
          </span>
          <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-600 font-medium rounded-full ml-auto">
            {course?.level || courseJson?.level || "Beginner"}
          </span>
        </div>

        {/* Progress indicator / quick start */}
        <div className="mt-2">
          {!progressLoading && isEnrolled ? (
            courseProgress > 0 ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{courseProgress}% started</div>
                <Progress value={courseProgress} className="h-2" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Not started</div>
                <button
                  onClick={startCourse}
                  disabled={loading}
                  className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded"
                >
                  {loading ? 'Starting...' : 'Start'}
                </button>
              </div>
            )
          ) : null}
        </div>

        {/* ✅ Gradient Buttons */}
        {hasCourseContent ? (
          isEnrolled ? (
            <Link href={`/workspace/view-course/${course?.cid}`}>
              <Button
                className="relative w-full text-[11px] overflow-hidden text-white font-semibold flex items-center justify-center gap-2 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-700
                bg-gradient-to-r from-green-500 to-green-600
                hover:from-green-600 hover:to-green-700"
              >
                <CheckCircle2 size={14} /> Continue Learning
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onEnrollCourse}
              disabled={loading}
              className={`relative w-full text-[11px] overflow-hidden text-white font-semibold flex items-center justify-center gap-2 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-700 
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
              hover:from-pink-500 hover:via-indigo-500 hover:to-purple-500
              before:absolute before:inset-0 before:animate-shimmer before:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.3),transparent)] before:translate-x-[-100%]
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" size={14} /> Enrolling...
                </>
              ) : (
                <>
                  <PlayCircle size={14} /> Enroll Course
                </>
              )}
            </Button>
          )
        ) : (
          <Link href={`/workspace/edit-course/${course?.cid}`}>
            <Button
              className="relative w-full text-[11px] overflow-hidden text-white font-semibold flex items-center justify-center gap-2 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-700
              bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800
              hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500
              before:absolute before:inset-0 before:animate-shimmer before:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.3),transparent)] before:translate-x-[-100%]"
            >
              <Settings size={14} /> Generate Course
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
