"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import LandingHero from "./_components/landing/LandingHero";
import LandingFeatures from "./_components/landing/LandingFeatures";
import LandingCategories from "./_components/landing/LandingCategories";
import LandingTeachers from "./_components/landing/LandingTeachers";
import { Footer } from "./_components/landing/Footer";
import LatestVideos from "./_components/youtube/LatestVideos";

export default function Landing() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full h-16 bg-white border-b z-50">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              LearnHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#categories" className="text-gray-600 hover:text-gray-900">
              Categories
            </Link>
            <Link href="#teachers" className="text-gray-600 hover:text-gray-900">
              Teachers
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isSignedIn ? (
              <>
                <Link
                  href="/sign-in"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/workspace"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <LandingHero />
        <LandingFeatures />
        <LandingCategories />
        <LandingTeachers />
        <LatestVideos />
        <Footer />
      </main>
    </div>
  );
}