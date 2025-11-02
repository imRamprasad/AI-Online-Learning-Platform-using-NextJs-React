"use client";

import { Code, Layout, Palette, Server } from "lucide-react";

const categories = [
  {
    icon: Code,
    title: "Programming",
    description: "Learn coding languages and software development",
    courses: 483,
    accent: "from-blue-500 to-blue-700",
  },
  {
    icon: Layout,
    title: "Design",
    description: "Master UI/UX and graphic design principles",
    courses: 329,
    accent: "from-pink-500 to-rose-700",
  },
  {
    icon: Server,
    title: "DevOps",
    description: "Learn cloud infrastructure and deployment",
    courses: 215,
    accent: "from-green-500 to-emerald-700",
  },
  {
    icon: Palette,
    title: "Digital Art",
    description: "Create stunning digital artwork and illustrations",
    courses: 189,
    accent: "from-purple-500 to-violet-700",
  },
];

export default function LandingCategories() {
  return (
    <section id="categories" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse by{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              category
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Explore our wide range of courses across different domains
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <category.icon className={`w-6 h-6 bg-gradient-to-r ${category.accent} text-transparent bg-clip-text`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="text-sm text-gray-500">
                  {category.courses.toLocaleString()} courses
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r ${category.accent}`} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
}