"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Book, LineChart } from "lucide-react";
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



  const bannerSrc = React.useMemo(() => {
    let src =
      course?.bannerImageURL ??
      parseCourse?.bannerImageURL ??
      "/no-courses.png";

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
          <Clock className="text-blue-600 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-800">Duration</h3>
            <p className="text-gray-600">
              {parseCourse.duration ?? "2 Hours"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl shadow-sm">
          <Book className="text-green-600 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-800">Chapters</h3>
            <p className="text-gray-600">{parseCourse.noOfChapters ?? 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl shadow-sm">
          <LineChart className="text-red-600 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-800">Difficulty</h3>
            <p className="text-gray-600">{parseCourse.level ?? "Beginner"}</p>
          </div>
        </div>
      </div>

      {/* ✅ Action Buttons */}
      <div className="flex justify-center gap-4">
        {isViewMode && (
          <Link href={`/workspace/view-course/${course?.cid}`}>
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Continue Learning
            </Button>
          </Link>
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
