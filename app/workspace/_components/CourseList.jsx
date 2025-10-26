"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AddNewCourseDialog from "./AddNewCourseDilog";

function CourseList() {
  const [courseList, setCourseList] = useState([]);

  const handleAddCourse = (course) => {
    setCourseList((prev) => [...prev, course]);
  };

  return (
    <div className="p-6">
      <h2 className="font-bold text-3xl mb-6">Course List</h2>

      {courseList.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <Image
            src="/no-courses.png"
            alt="No Courses"
            width={120}
            height={120}
          />
          <h2 className="text-lg font-medium text-gray-700 text-center">
            Looks like you haven't created any courses yet
          </h2>
          <AddNewCourseDialog onAddCourse={handleAddCourse}>
            <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              + Create your first course
            </Button>
          </AddNewCourseDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseList.map((course, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm">{course.description}</p>
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <AddNewCourseDialog onAddCourse={handleAddCourse}>
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                + Add Another Course
              </Button>
            </AddNewCourseDialog>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseList;
