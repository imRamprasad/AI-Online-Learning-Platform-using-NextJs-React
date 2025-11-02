"use client";

import Image from "next/image";

const teachers = [
  {
    name: "Dr. Sarah Chen",
    role: "Machine Learning Expert",
    students: 15420,
    courses: 12,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    name: "Alex Thompson",
    role: "Full-Stack Developer",
    students: 12850,
    courses: 8,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  },
  {
    name: "Maria Garcia",
    role: "UI/UX Designer",
    students: 10230,
    courses: 6,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  },
  {
    name: "David Kim",
    role: "DevOps Engineer",
    students: 8940,
    courses: 5,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
];

export default function LandingTeachers() {
  return (
    <section id="teachers" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Learn from the{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              best teachers
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Our expert instructors bring real-world experience to their teaching
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group"
            >
              <div className="relative h-48">
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  {teacher.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{teacher.role}</p>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {teacher.students.toLocaleString()}
                    </div>
                    <div className="text-gray-600 text-xs">Students</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {teacher.courses}
                    </div>
                    <div className="text-gray-600 text-xs">Courses</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {teacher.rating}
                    </div>
                    <div className="text-gray-600 text-xs">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition">
            View All Teachers
          </button>
        </div>
      </div>
    </section>
  );
}