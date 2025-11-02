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

function ViewCourse() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(null);
  const [completedChapters, setCompletedChapters] = useState({});

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}`);
        const courseData = response.data;
        
        console.log("Course Data:", courseData);
        console.log("Course JSON:", courseData.courseJson);
        
        // Convert generated course content to match the expected format
        if (courseData.courseJson && courseData.courseJson.chapters) {
          console.log("Processing chapters:", courseData.courseJson.chapters);

          // helper: try to find a YouTube url or id in a string
          const extractYouTubeUrl = (text) => {
            if (!text) return null;
            // normalize
            if (typeof text !== 'string') text = JSON.stringify(text);
            // decode simple HTML entities we commonly see in generated content
            text = text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

            // 1) look for full youtube/watch or youtu.be or embed urls
            const fullUrlRegex = /(https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=[A-Za-z0-9_-]+(?:&[^\s]*)?|embed\/[A-Za-z0-9_-]+)|https?:\/\/(?:www\.)?youtu\.be\/[A-Za-z0-9_-]+)/i;
            const fullMatch = text.match(fullUrlRegex);
            if (fullMatch) return fullMatch[0];

            // 2) extract v= param
            const vParam = text.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
            if (vParam && vParam[1]) return `https://www.youtube.com/watch?v=${vParam[1]}`;

            // 3) extract youtu.be short link id
            const shortMatch = text.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
            if (shortMatch && shortMatch[1]) return `https://www.youtube.com/watch?v=${shortMatch[1]}`;

            // 4) extract embed id
            const embedMatch = text.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/i);
            if (embedMatch && embedMatch[1]) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;

            // 5) look for a standalone 11-char YouTube id only if the surrounding text suggests youtube
            if (/(youtube|youtu\.be|watch\?v=|embed\/)/i.test(text)) {
              const idMatch = text.match(/\b([A-Za-z0-9_-]{11})\b/);
              if (idMatch && idMatch[1]) return `https://www.youtube.com/watch?v=${idMatch[1]}`;
            }

            return null;
          };

          courseData.courseContent = {
            chapters: courseData.courseJson.chapters.map((chapter, index) => {
              console.log("Processing chapter:", chapter);

              // check many possible video field names
              let videoUrl = chapter.videoUrl || chapter.video_url || chapter.youtube || chapter.youtubeUrl || chapter.youtube_link || null;

              // if not present, try to extract from any HTML/content fields in the chapter
              if (!videoUrl) {
                // some generated content may be stored in chapter.content or in the course's coursesContent
                if (chapter.content) videoUrl = extractYouTubeUrl(typeof chapter.content === 'string' ? chapter.content : JSON.stringify(chapter.content));
                if (!videoUrl && courseData.coursesContent) {
                  try {
                    const cc = Array.isArray(courseData.coursesContent) ? courseData.coursesContent : (courseData.coursesContent || []);
                    // try to find a matching chapter by name and pull video url if present
                    for (const c of cc) {
                      if (c.chapterName && chapter.chapterName && c.chapterName === chapter.chapterName) {
                        videoUrl = c.videoUrl || c.video_url || extractYouTubeUrl(c.content || JSON.stringify(c));
                        if (videoUrl) break;
                      }
                      // fallback: scan content string for youtube link
                      const found = extractYouTubeUrl(JSON.stringify(c));
                      if (!videoUrl && found) {
                        videoUrl = found; break;
                      }
                    }
                  } catch (err) {
                    console.warn('Error reading coursesContent for videoUrl', err);
                  }
                }
              }

              // final fallback: search chapter topics joined text
              if (!videoUrl && Array.isArray(chapter.topics)) {
                videoUrl = extractYouTubeUrl(chapter.topics.join('\\n'));
              }

              return {
                id: `chapter-${index + 1}`,
                title: chapter.chapterName,
                duration: chapter.duration,
                topics: chapter.topics,
                videoUrl: videoUrl,
                content: `# ${chapter.chapterName}\n\n${chapter.topics.map(topic => `## ${topic}\n`).join('\n')}`
              };
            })
          };
        }
        
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
        toast.error('Failed to load course content');
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
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
      const chapters = course?.courseContent?.chapters || [];
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
    // <div className="min-h-[calc(100vh-4rem)]">
    //   {/* Course Header */}
    //   <div className="bg-white border-b">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="py-4 flex items-center justify-between">
    //         <div className="flex items-center gap-4">
    //           <Link
    //             href="/workspace"
    //             className="text-gray-500 hover:text-gray-700 transition-colors"
    //           >
    //             <ArrowLeft className="h-5 w-5" />
    //           </Link>
    //           <div>
    //             <h1 className="text-xl font-semibold text-gray-900">
    //               {course.name}
    //             </h1>
    //             <div className="flex items-center gap-2 text-sm text-gray-500">
    //               <span>{course.level}</span>
    //               <span>•</span>
    //               <span>{course.category}</span>
    //             </div>
    //           </div>
    //         </div>
    //         <div className="flex items-center gap-4">
    //           <div className="text-right">
    //             <div className="text-sm text-gray-500">Progress</div>
    //             <div className="text-sm font-medium">{progress}% Complete</div>
    //           </div>
    //           <div className="w-32">
    //             <Progress value={progress} className="h-2" />
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Course Content */}
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    //     <div className="flex flex-col lg:flex-row gap-6">
    //       {/* Main Content */}
    //       <div className="lg:flex-1 lg:order-2">
    //         {activeChapter ? (
    //           <div className="bg-white rounded-xl shadow-sm border">
    //             <div className="p-6">
    //               <h2 className="text-2xl font-semibold mb-4">
    //                 {activeChapter.title}
    //               </h2>
                  
    //               {/* Video Section */}
    //               {activeChapter.videoUrl && (
    //                 <div className="relative aspect-video mb-6 bg-black rounded-lg overflow-hidden">
    //                   <iframe
    //                     src={activeChapter.videoUrl}
    //                     className="absolute inset-0 w-full h-full"
    //                     allowFullScreen
    //                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    //                   />
    //                 </div>
    //               )}

    //               {/* Chapter Content */}
    //               <div className="prose prose-blue max-w-none">
    //                 <ReactMarkdown>{activeChapter.content || ''}</ReactMarkdown>
    //               </div>

    //               {/* Chapter Topics */}
    //               {activeChapter.topics?.length > 0 && (
    //                 <div className="mt-6 p-4 bg-gray-50 rounded-lg">
    //                   <h3 className="font-medium mb-2">Topics Covered</h3>
    //                   <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    //                     {activeChapter.topics.map((topic, index) => (
    //                       <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
    //                         <CheckCircle className="h-4 w-4 text-green-500" />
    //                         {topic}
    //                       </li>
    //                     ))}
    //                   </ul>
    //                 </div>
    //               )}

    //               {/* Complete Button */}
    //               <div className="mt-6 flex items-center justify-between">
    //                 <Button
    //                   onClick={() => markChapterComplete(activeChapter.id)}
    //                   disabled={completedChapters[activeChapter.id]}
    //                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
    //                 >
    //                   {completedChapters[activeChapter.id] ? (
    //                     <>
    //                       <CheckCircle className="h-4 w-4 mr-2" />
    //                       Completed
    //                     </>
    //                   ) : (
    //                     'Mark as Complete'
    //                   )}
    //                 </Button>

    //                 {/* Progress Indicator */}
    //                 <div className="text-sm text-gray-500">
    //                   {Object.keys(completedChapters).length} of {course.courseContent?.chapters?.length} chapters complete
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         ) : (
    //           <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
    //             <Video className="h-12 w-12 mx-auto text-gray-400" />
    //             <h3 className="mt-4 text-lg font-medium text-gray-900">
    //               Start Your Learning Journey
    //             </h3>
    //             <p className="mt-2 text-sm text-gray-500">
    //               Select a chapter from the list to begin learning
    //             </p>
    //           </div>
    //         )}
    //       </div>

    //       {/* Sidebar */}
    //       <div className="lg:w-80 lg:order-1">
    //         <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
    //           <div className="p-4 border-b bg-gray-50">
    //             <h3 className="font-medium">Course Content</h3>
    //             <p className="text-sm text-gray-500 mt-1">
    //               {course.courseContent?.chapters?.length} chapters • {progress}% Complete
    //             </p>
    //           </div>
    //           <div className="divide-y">
    //             {course.courseContent?.chapters?.map((chapter, index) => (
    //               <button
    //                 key={chapter.id}
    //                 onClick={() => setActiveChapter(chapter)}
    //                 className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
    //                   activeChapter?.id === chapter.id ? 'bg-gray-50' : ''
    //                 }`}
    //               >
    //                 <div className="flex items-center gap-3">
    //                   {completedChapters[chapter.id] ? (
    //                     <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
    //                   ) : chapter.videoUrl ? (
    //                     <Video className="h-5 w-5 text-gray-400 flex-shrink-0" />
    //                   ) : (
    //                     <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0" />
    //                   )}
    //                   <div>
    //                     <div className="font-medium text-sm">
    //                       {index + 1}. {chapter.title}
    //                     </div>
    //                     <p className="text-xs text-gray-500 mt-0.5">
    //                       {chapter.duration} min
    //                     </p>
    //                   </div>
    //                 </div>
    //               </button>
    //             ))}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
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
                  {course.name}
                </h1>
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
                  {Object.keys(completedChapters).length} of {course.courseContent?.chapters?.length} chapters
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
                    value={(Object.keys(completedChapters).length / (course.courseContent?.chapters?.length || 1)) * 100}
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
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    {activeChapter.title}
                  </h2>
                  
                  {/* Video Section */}
                  {console.log("Active Chapter:", activeChapter)}
                  {activeChapter.videoUrl && (
                    <div className="relative aspect-video mb-6 bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={(() => {
                          const url = activeChapter.videoUrl;
                          if (url.includes('youtube.com/watch?v=')) {
                            return `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
                          } else if (url.includes('youtu.be/')) {
                            return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`;
                          } else if (url.includes('youtube.com/embed/')) {
                            return url;
                          }
                          return url;
                        })()}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
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
                      {Object.keys(completedChapters).length} of {course.courseContent?.chapters?.length} chapters complete
                    </div>
                  </div>
                </div>
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
                  {course.courseContent?.chapters?.length} chapters
                </p>
              </div>
              <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
                {course.courseContent?.chapters?.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveChapter(chapter)}
                    className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                      activeChapter?.id === chapter.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {completedChapters[chapter.id] ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Video className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {index + 1}. {chapter.title}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {chapter.duration} min
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;
