"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

export default function LandingHero() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-[600px] bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="max-w-3xl">
            <div className="mb-8 inline-block">
              <span className="bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-2 rounded-full">
                ✨ No.1 Learning Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-up">
              Learn and Create
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                {" "}
                Interactive Courses
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 animate-fade-up delay-200">
              Build, share, and learn from a global community of educators. Create
              rich learning experiences with AI-powered tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              {!isSignedIn ? (
                <>
                  <Link
                    href="/sign-up"
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition flex items-center gap-2 group"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/workspace"
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition flex items-center gap-2 group"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}