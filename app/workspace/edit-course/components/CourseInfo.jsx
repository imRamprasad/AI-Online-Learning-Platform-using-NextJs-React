"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineClockCircle, AiOutlineBook } from "react-icons/ai";
import { FaChartLine } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Settings, PlayCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

function CourseInfo({ course, mode = "edit" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isViewMode = mode === "view";
  const [formData, setFormData] = useState({
    name: course?.name || "",
    description: course?.description || "",
    level: course?.level || "",
    category: course?.category || "",
  });
  const router = useRouter();

  const parseCourse = useMemo(() => {
    try {
      if (!course?.courseJson) return null;
      const parsed =
        typeof course.courseJson === "string"
          ? JSON.parse(course.courseJson)
          : course.courseJson;
      return parsed?.course ?? parsed;
    } catch (err) {
      console.error("❌ Failed to parse course JSON:", err);
      return null;
    }
  }, [course]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`/api/courses/${course.cid}`, formData);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error updating course:", err);
      setError("Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!parseCourse) return alert("Invalid course data. Try again.");
    setLoading(true);
    setError(null);
    setGenerated(false);

    try {
      const { data } = await axios.post("/api/generate-course-content", {
        courseJson: parseCourse,
        courseTitle: course?.name,
        courseId: course?.cid,
      });

      console.log("✅ Generated course content:", data);
      setGenerated(true);

      setTimeout(() => {
        router.push("/workspace");
      }, 700);
    } catch (err) {
      console.error("❌ Error generating course content:", err);
      setError("Failed to generate course content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bannerSrc = React.useMemo(() => {
    let src =
      course?.bannerImageURL ??
      parseCourse?.bannerImageURL ??
      "/default-course-banner.jpg";

    if (src.startsWith("//")) src = `https:${src}`;
    const looksLikeBase64 =
      !src.startsWith("data:") &&
      !/^https?:\/\//i.test(src) &&
      /^[A-Za-z0-9+/=\s]+$/.test(src) &&
      src.length > 200;
    if (looksLikeBase64)
      src = `data:image/png;base64,${src.replace(/\s+/g, "")}`;
    return src;
  }, [course, parseCourse]);

  const isAllowedHost = (url) => {
    try {
      const allowed = [
        "firebasestorage.googleapis.com",
        "aigurulab.tech",
        "cdn.aigurulab.tech",
        "images.unsplash.com",
      ];
      const u = new URL(url);
      return allowed.includes(u.hostname.toLowerCase());
    } catch {
      return false;
    }
  };

  if (!parseCourse)
    return (
      <p className="text-red-500 text-sm text-center mt-5">
        ⚠️ Course data unavailable or corrupted.
      </p>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-3xl mx-auto space-y-6 transition-transform duration-300 hover:shadow-2xl hover:scale-[1.01]">
      {/* ✅ Course Banner */}
      {bannerSrc && (
        <div className="w-full h-[400px] rounded-xl overflow-hidden relative">
          {isAllowedHost(bannerSrc) ? (
            <Image
              src={bannerSrc}
              alt={parseCourse.name ?? "Course banner"}
              width={800}
              height={400}
              priority
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          ) : (
            <img
              src={bannerSrc}
              alt={parseCourse.name ?? "Course banner"}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {isViewMode && (
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
              <p className="text-lg opacity-90">{formData.description}</p>
            </div>
          )}
        </div>
      )}

      {/* ✅ Edit Mode */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Course Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Difficulty Level</label>
            <Select
              onValueChange={(value) => handleSelectChange("level", value)}
              defaultValue={formData.level}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Input
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center space-y-2">
            <h2 className="font-bold text-2xl md:text-3xl text-gray-800">
              {formData.name ?? "Untitled Course"}
            </h2>
            <p className="text-gray-600 text-sm md:text-base line-clamp-3">
              {formData.description ?? "No description available."}
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit Course
            </Button>
          </div>
        </>
      )}

      {/* ✅ Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm md:text-base">
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl shadow-sm">
          <AiOutlineClockCircle className="text-blue-600 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-800">Duration</h3>
            <p className="text-gray-600">
              {parseCourse.duration ?? "2 Hours"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl shadow-sm">
          <AiOutlineBook className="text-green-600 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-800">Chapters</h3>
            <p className="text-gray-600">{parseCourse.noOfChapters ?? 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl shadow-sm">
          <FaChartLine className="text-red-600 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-800">Difficulty</h3>
            <p className="text-gray-600">{parseCourse.level ?? "Beginner"}</p>
          </div>
        </div>
      </div>

      {/* ✅ Action Buttons */}
      <div className="flex justify-center gap-4">
        {isViewMode ? (
          <Link href={`/workspace/view-course/${course?.cid}`}>
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Continue Learning
            </Button>
          </Link>
        ) : (
          <Button
            onClick={handleGenerateContent}
            disabled={loading}
            className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:from-pink-500 hover:to-indigo-500 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : generated ? (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Regenerate ✨
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Generate Content ✨
              </>
            )}
          </Button>
        )}
      </div>

      {/* ✅ Messages */}
      {error && (
        <p className="text-center text-red-500 text-sm mt-3">{error}</p>
      )}
      {generated && !error && (
        <p className="text-center text-green-600 text-sm mt-3">
          ✅ Course content successfully generated! Redirecting...
        </p>
      )}
    </div>
  );
}

export default CourseInfo;
