"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  BookOpen,
  Clock,
  CheckCircle,
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
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

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view your profile</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(c => c.progress === 100).length;
  const averageProgress = totalCourses > 0
    ? Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / totalCourses)
    : 0;
  const totalChapters = enrolledCourses.reduce((acc, c) => acc + c.totalChapters, 0);
  const completedChapters = enrolledCourses.reduce((acc, c) => acc + c.completedCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and track your learning progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {user.firstName?.[0] || user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-600">{user.emailAddresses?.[0]?.emailAddress}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.emailAddresses?.[0]?.emailAddress}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="w-8 h-8 text-indigo-600 mr-4" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
                      <p className="text-sm text-gray-600">Courses Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-orange-600 mr-4" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
                      <p className="text-sm text-gray-600">Average Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
                <CardDescription>
                  Track your overall learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span>{averageProgress}%</span>
                    </div>
                    <Progress value={averageProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">{completedChapters}</p>
                      <p className="text-sm text-gray-600">Chapters Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{totalChapters}</p>
                      <p className="text-sm text-gray-600">Total Chapters</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrolled Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  My Courses
                </CardTitle>
                <CardDescription>
                  Courses you're currently enrolled in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses enrolled</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by enrolling in courses</p>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.map((course) => (
                      <div key={course.cid} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{course.name}</h4>
                            <p className="text-sm text-gray-600">{course.level} • {course.category}</p>
                          </div>
                          <Badge variant={course.progress === 100 ? "default" : "secondary"}>
                            {course.progress}% Complete
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <Progress value={course.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{course.completedCount} of {course.totalChapters} chapters</span>
                          <span>{course.estimatedTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
