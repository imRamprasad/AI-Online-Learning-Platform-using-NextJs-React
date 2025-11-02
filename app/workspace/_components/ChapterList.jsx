"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AddNewCourseDialog from "./AddNewCourseDilog";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import CourseCard from "./CourseCard"; // ✅ Make sure you have this component

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const { user } = useUser();

  // ✅ Fetch all courses when user is available
  useEffect(() => {
    if (user) {
      GetCourseList();
    }
  }, [user]);

  // ✅ Fetch courses from backend
  const GetCourseList = async () => {
    try {
      const result = await axios.get("/api/courses");
      console.log("✅ Courses fetched:", result.data);
      setCourseList(result.data || []);
    } catch (error) {
      console.error("❌ Error fetching course list:", error);
    }
  };

  // ✅ Add new course to database and local state
  const handleAddCourse = async (course) => {
    try {
      const result = await axios.post("/api/courses", course);
      setCourseList((prev) => [...prev, result.data]); // add returned course
      console.log("✅ Course added:", result.data);
    } catch (error) {
      console.error("❌ Error adding course:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="font-bold text-3xl mb-6">📚 Course List</h2>

      {/* If no courses exist */}
      {courseList.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <Image
            src="/no-courses.png"
            alt="No Courses"
            width={120}
            height={120}
          />
          <h2 className="text-lg font-medium text-gray-700 text-center">
            Looks like you haven’t created any courses yet
          </h2>
          <AddNewCourseDialog onAddCourse={handleAddCourse}>
            <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              + Create your first course
            </Button>
          </AddNewCourseDialog>
        </div>
      ) : (
        <>
          {/* Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseList.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>

          {/* Add more button */}
          <div className="flex justify-center mt-8">
            <AddNewCourseDialog onAddCourse={handleAddCourse}>
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                + Add Another Course
              </Button>
            </AddNewCourseDialog>
          </div>
        </>
      )}
    </div>
  );
}

export default CourseList;
