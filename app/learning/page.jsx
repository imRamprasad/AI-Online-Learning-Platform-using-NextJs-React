"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Clock, CheckCircle, Play, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const LearningPage = () => {
  const { user } = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await axios.get('/api/user/enrolled-courses');
        setEnrolledCourses(response.data);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        toast.error('Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No courses enrolled yet</h2>
            <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
            <Link href="/workspace">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => (
              <Card key={enrollment.cid} className="hover:shadow-lg transition-shadow">
                <div className="relative h-[140px] w-full">
                  {enrollment.banner ? (
                    <Image
                      alt={enrollment.name}
                      loading="lazy"
                      decoding="async"
                      data-nimg="fill"
                      className="object-cover"
                      src={enrollment.banner}
                      style={{ position: 'absolute', height: '100%', width: '100%', inset: '0px', color: 'transparent' }}
                      width={400}
                      height={200}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{enrollment.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {enrollment.level} • {enrollment.category}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {enrollment.progress}% Complete
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{enrollment.numberOfChapters} chapters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{enrollment.estimatedTime || '2h'}</span>
                      </div>
                    </div>

                    {/* Next Chapter */}
                    {enrollment.nextChapter && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Play className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-800 font-medium">Next:</span>
                          <span className="text-blue-700">{enrollment.nextChapter.title}</span>
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    <Link href={`/workspace/view-course/${enrollment.cid}`}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                        {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Learning Stats */}
        {enrolledCourses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="w-8 h-8 text-indigo-600 mr-4" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                      <p className="text-sm text-gray-600">Courses Enrolled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {enrolledCourses.filter(c => c.progress === 100).length}
                      </p>
                      <p className="text-sm text-gray-600">Courses Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-orange-600 mr-4" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)}%
                      </p>
                      <p className="text-sm text-gray-600">Average Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPage;
