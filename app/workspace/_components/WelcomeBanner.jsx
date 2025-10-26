"use client";

import React from "react";

function WelcomeBanner() {
  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 md:p-6 shadow-md text-white mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Text Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">
            Welcome to Online Learning Platform
          </h2>
          <p className="mt-1 text-sm md:text-sm text-indigo-100">
            Learn, create, and explore courses
          </p>
        </div>

        {/* CTA Button */}
        <div>
          <button className="mt-2 md:mt-0 px-3 py-1.5 font-medium rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 transition">
            Explore Courses
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
