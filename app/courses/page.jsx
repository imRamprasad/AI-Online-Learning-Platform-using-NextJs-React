"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2,
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  Star,
  PlayCircle,
  CheckCircle2,
  LoaderCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const CoursesPage = () => {
  const { user, isLoaded } = useUser();
  const [courses, setCourses] = useState([]);
  const [enrolledCids, setEnrolledCids] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Fetch all available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // This would need a public courses API endpoint
        // For now, we'll fetch from the existing API but this might need modification
        const response = await axios.get('/api/courses');
        const allCourses = response.data || [];
        const filtered = allCourses.filter(course => course.cid !== 'test-cid-1');
        setCourses(filtered);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourses();
      getEnrolledCids();
    }
  }, [user]);

  // Fetch enrolled course IDs
  const getEnrolledCids = async () => {
    try {
      const res = await axios.get('/api/enroll-course');
      const enrolled = res.data || [];
      const cids = new Set(enrolled.map(e => e.courses?.cid).filter(Boolean));
      setEnrolledCids(cids);
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
    }
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique categories and levels for filters
  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
  const levels = [...new Set(courses.map(course => course.level).filter(Boolean))];

  // Handle course enrollment
  const handleEnrollCourse = async (course) => {
    try {
      const result = await axios.post("/api/enroll-course", {
        courseId: course.cid,
      });

      if (result.data.success) {
        toast.success("✅ Enrolled Successfully!");
        setEnrolledCids(prev => new Set([...prev, course.cid]));
      }
    } catch (e) {
      console.error("Enrollment Error:", e);
      toast.error(e.response?.data?.error || "❌ Failed to enroll in the course");
    }
  };

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
          <p className="text-gray-600">You need to be signed in to browse courses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-gray-600">Discover and enroll in courses to start your learning journey</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {courses.length === 0 ? 'No courses available' : 'No courses match your filters'}
            </h2>
            <p className="text-gray-600 mb-6">
              {courses.length === 0
                ? 'Courses will appear here once they are created.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {courses.length === 0 && (
              <Link href="/workspace">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  Create Your First Course
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCids.has(course.cid);
              const hasContent = course.coursesContent || (course.courseJson?.chapters?.length > 0);

              return (
                <Card key={course.cid} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={course.bannerImageURL || `https://placehold.co/400x200?text=${encodeURIComponent(course.name)}`}
                      alt={course.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                      unoptimized={true}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        {course.level || 'Beginner'}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{course.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.numberOfChapters || 0} chapters</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>~{Math.ceil((course.numberOfChapters || 1) * 15 / 60)}h</span>
                        </div>
                      </div>

                      {/* Category */}
                      {course.category && (
                        <Badge variant="outline" className="w-fit">
                          {course.category}
                        </Badge>
                      )}

                      {/* Action Button */}
                      {hasContent ? (
                        isEnrolled ? (
                          <Link href={`/workspace/view-course/${course.cid}`}>
                            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Continue Learning
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            onClick={() => handleEnrollCourse(course)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Enroll Now
                          </Button>
                        )
                      ) : (
                        <div className="text-center text-sm text-gray-500 py-2">
                          Course content not available yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {courses.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
