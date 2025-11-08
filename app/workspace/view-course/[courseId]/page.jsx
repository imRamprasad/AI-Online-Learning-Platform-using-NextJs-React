"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Loader2, ArrowLeft, Video, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import DoubtsChat from '@/components/DoubtsChat';

function ViewCourse() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(null);
  const [completedChapters, setCompletedChapters] = useState({});

  const extractYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
    return match ? match[1] : null;
  };

  const chapters = course?.courseJson?.chapters || [];
  const progress = chapters.length
    ? (Object.keys(completedChapters).length / chapters.length) * 100
    : 0;

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Validate courseId before making API call
        if (!courseId || courseId === 'undefined') {
          toast.error('Invalid course ID');
          router.push('/workspace');
          return;
        }

        const response = await axios.get(`/api/courses/${courseId}`);
        const courseData = response.data;

        console.log("Course data received from API:", JSON.stringify(courseData, null, 2));

        console.log("Course Data:", courseData);
        console.log("Course JSON:", courseData.courseJson);
        console.log("Course JSON Chapters:", courseData.courseJson?.chapters);

        setCourse(courseData);

        // Set completed chapters from the API response
        if (courseData.completedChapters) {
          setCompletedChapters(courseData.completedChapters);
        }

        // If not enrolled, redirect to courses page
        if (!courseData.isEnrolled) {
          toast.error('Please enroll in this course first');
          router.push('/workspace');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        if (error.response?.status === 404) {
          toast.error('Course not found');
          router.push('/workspace');
          return;
        }
        toast.error('Failed to load course content');
        setLoading(false);
      }
    };

    if (courseId && courseId !== 'undefined') {
      fetchCourse();
    } else {
      toast.error('Invalid course ID');
      router.push('/workspace');
    }
  }, [courseId]);

  // Mark chapter as complete
  const markChapterComplete = async (chapterId) => {
    try {
      const updatedCompletedChapters = {
        ...completedChapters,
        [chapterId]: true
      };

      await axios.patch(`/api/enroll-course`, {
        courseId,
        completedChapters: updatedCompletedChapters
      });

      setCompletedChapters(updatedCompletedChapters);
      toast.success('Progress saved!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to save progress');
    }
  };

  // Mark the next incomplete chapter as complete (used when clicking the progress bar)
  const markNextChapterComplete = async () => {
    try {
      const next = chapters.find((ch) => !completedChapters[ch.id]);
      if (!next) {
        toast('All chapters already completed');
        return;
      }

      // call existing helper
      await markChapterComplete(next.id);

      // optionally set that chapter as active so user can see content
      setActiveChapter(next);
    } catch (err) {
      console.error('Error marking next chapter complete:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground">This course might have been removed or you don't have access.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workspace"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {course.courseJson?.name}
                </h1>
                <Link href={`/workspace/edit-course/${courseId}`}>
                  <Button className="ml-4">Edit</Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{course.courseJson?.level || 'Beginner'}</span>
                  <span>•</span>
                  <span>{course.courseJson?.duration || '2 Hours'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-sm font-medium">
                  {progress.toFixed(0)}% Complete
                </div>
              </div>
              <div className="w-32">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={markNextChapterComplete}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') markNextChapterComplete(); }}
                  title="Click to mark next chapter as complete"
                  className="cursor-pointer"
                >
                  <Progress
                    value={progress}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:flex-1 lg:order-2">
            {activeChapter ? (
              <div className="space-y-6">
                {/* Chapter Content */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      {activeChapter.chapterName || activeChapter.title}
                    </h2>

                    {/* Video Section */}
                    {console.log("Active Chapter:", activeChapter)}

                    {activeChapter?.videoUrl ? (
                      <iframe
                        width="100%"
                        height="480"
                        src={activeChapter.videoUrl.replace("watch?v=", "embed/")}
                        title={activeChapter.chapterName}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <p className="text-gray-500">No video available for this chapter.</p>
                    )}

                    {/* Chapter Content */}
                    <div className="prose prose-blue max-w-none">
                      <ReactMarkdown>{activeChapter.content || ''}</ReactMarkdown>
                    </div>

                    {/* Chapter Topics */}
                    {activeChapter.topics?.length > 0 && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Topics Covered</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeChapter.topics.map((topic, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Complete Button */}
                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        onClick={() => markChapterComplete(activeChapter.id)}
                        disabled={completedChapters[activeChapter.id]}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        {completedChapters[activeChapter.id] ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>

                      {/* Progress Indicator */}
                      <div className="text-sm text-gray-500">
                        {Object.keys(completedChapters).length} of {chapters.length} chapters complete
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Doubts Chat */}
                <DoubtsChat
                  chapter={activeChapter}
                  courseId={courseId}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <Video className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Start Your Learning Journey
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a chapter from the list to begin learning
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-4">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">Course Content</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {chapters.length} chapters
                </p>
              </div>
              <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
                {chapters.length > 0 ? (
                  chapters.map((chapter, index) => {
                    // Generate a unique ID for each chapter based on index since they don't have IDs
                    const chapterId = chapter.id || `chapter-${index}`;
                    return (
                      <button
                        key={chapterId}
                        onClick={() => setActiveChapter({...chapter, id: chapterId})}
                        className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                          activeChapter?.id === chapterId ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {chapter.videoThumbnailUrl && (
                            <img src={chapter.videoThumbnailUrl} alt="Video Thumbnail" className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                          )}
                          {completedChapters[chapterId] ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : chapter.videoUrl ? (
                            <Video className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-medium text-sm">
                              {index + 1}. {chapter.chapterName || chapter.title}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {chapter.duration || 'Video Lesson'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No chapters available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;
