"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AppHeader from "@/app/workspace/_components/AppHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  ChevronRight,
  Trophy,
  Users,
  Loader2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function Course() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}`);
        setCourse(response.data);
        
        // Calculate progress if enrolled
        if (response.data.isEnrolled && response.data.completedChapters) {
          const completed = Object.keys(response.data.completedChapters).length;
          const total = response.data.courseJson?.chapters?.length || 0;
          setProgress(total > 0 ? (completed / total) * 100 : 0);
        }
        
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader hideSidebar={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader hideSidebar={true} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">This course might have been removed or you don't have access.</p>
          <Link href="/workspace">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader hideSidebar={true} />
      
      {/* Hero Section with Course Banner */}
      <div className="relative h-[400px] w-full">
        <Image
          src={course.bannerImageURL || `https://placehold.co/1200x400?text=${encodeURIComponent(course.name)}`}
          alt={course.name}
          fill
          className="object-cover"
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                {course.courseJson?.level || 'Beginner'}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                {course.courseJson?.duration || '2 Hours'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.name}</h1>
            <p className="text-lg opacity-90 mb-6 max-w-3xl">{course.description}</p>
            {course.isEnrolled ? (
              <Link href={`/workspace/view-course/${courseId}`}>
                <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Continue Learning
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100"
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/enroll-course', { courseId });
                    if (response.data.success) {
                      toast.success('Successfully enrolled in the course');
                      window.location.href = `/workspace/view-course/${courseId}`;
                    }
                  } catch (error) {
                    console.error('Enrollment failed:', error);
                    toast.error(error.response?.data?.error || 'Failed to enroll in the course');
                  }
                }}
              >
                Start Learning Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">About this Course</h2>
                <p className="text-gray-600">{course.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.courseJson?.chapters?.map((chapter, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>{chapter.chapterName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {course.isEnrolled && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">
                    {progress.toFixed(0)}% Complete • 
                    {Object.keys(course.completedChapters || {}).length} of {course.courseJson?.chapters?.length || 0} chapters completed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                <h3 className="text-xl font-semibold mb-4">Course Features</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <span>{course.courseJson?.chapters?.length || 0} Chapters</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <span>{course.courseJson?.duration || '2 Hours'} Duration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span>{course.courseJson?.level || 'Beginner'} Level</span>
                  </li>
                </ul>
              </div>

              <div className="p-6">
                {course.isEnrolled ? (
                  <Link href={`/workspace/view-course/${courseId}`}>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    onClick={async () => {
                      try {
                        const response = await axios.post('/api/enroll-course', { courseId });
                        if (response.data.success) {
                          toast.success('Successfully enrolled in the course');
                          window.location.href = `/workspace/view-course/${courseId}`;
                        }
                      } catch (error) {
                        console.error('Enrollment failed:', error);
                        toast.error(error.response?.data?.error || 'Failed to enroll in the course');
                      }
                    }}
                  >
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Course;
