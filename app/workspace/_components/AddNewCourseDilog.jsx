"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function AddNewCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chapters: "",
    difficulty: "",
    category: "",
    includeVideo: false,
  });
  const [message, setMessage] = useState("");
  const [generatedCourse, setGeneratedCourse] = useState(null);

  const onGenerate = async () => {
    console.log(formData);
    setLoading(true);
    setMessage("");
    setGeneratedCourse(null);
    try {
      // normalize payload keys to what the API expects
      const payload = {
        name: formData.name,
        description: formData.description,
        noOfChapters: Number(formData.chapters) || 0,
        includeVideo: Boolean(formData.includeVideo),
        level: formData.difficulty || formData.level || null,
        category: formData.category,
      };

      const result = await axios.post("/api/generate-course-layout", payload);
      // prefer returned created row, then course, then raw data
      const created = result?.data?.created || result?.data?.course || result?.data;
      setGeneratedCourse(created);
      setMessage("Course generated and saved.");
    } catch (err) {
      console.error('Generate error', err);
      // capture server response body if available for debugging
      const serverDetails = err?.response?.data || err?.message || String(err);
      setMessage(typeof serverDetails === 'string' ? serverDetails : JSON.stringify(serverDetails, null, 2));
      setGeneratedCourse(err?.response?.data || null);
    } finally {
      setLoading(false);
    }

  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg w-full rounded-xl p-3 space-y-3 shadow-lg border border-gray-100 bg-gradient-to-b from-white via-gray-50 to-gray-100">
        {/* Header */}
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Create New Course Using AI
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-xs">
            Fill in the details below and let AI build your course layout.
          </DialogDescription>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Course Name */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Course Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter course name"
              className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 transition-all text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your course"
              rows={2}
              className="mt-1 p-1 w-full border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none transition-all text-xs"
            />
          </div>

          {/* Chapters */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Number of Chapters
            </label>
            <Input
              type="number"
              min="1"
              value={formData.chapters}
              onChange={(e) =>
                setFormData({ ...formData, chapters: e.target.value })
              }
              placeholder="No. of chapters"
              className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 transition-all text-xs"
            />
          </div>

          {/* Include Video */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">
              Include Video
            </label>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  includeVideo: !formData.includeVideo,
                })
              }
              className={`px-2 py-1 rounded-full font-medium transition-all shadow-sm text-xs ${
                formData.includeVideo
                  ? "bg-indigo-500 text-white shadow-indigo-200 hover:bg-indigo-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {formData.includeVideo ? "Yes" : "No"}
            </button>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Difficulty Level
            </label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, difficulty: value })
              }
            >
              <SelectTrigger className="w-full mt-1 border-gray-300 focus:ring-1 focus:ring-indigo-300 text-xs">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Category
            </label>
            <Input
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="e.g., Web Dev, AI, Design"
              className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 transition-all text-xs"
            />
          </div>

          {/* Generate Button */}
          <div className="pt-1">
            <Button
              onClick={onGenerate}
              disabled={loading}
              className={`w-full text-white font-semibold py-1.5 rounded-lg shadow transition-all duration-300 text-sm ${
                loading
                  ? "bg-indigo-400 cursor-wait"
                  : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-purple-600 hover:to-indigo-600"
              }`}
            >
              {loading ? "Generating..." : "Generate Course"}
            </Button>

            {message && (
              <p className="text-center mt-1 text-xs text-gray-700 animate-pulse">
                {message}
              </p>
            )}
          </div>

          {/* Display Generated Course JSON */}
          {generatedCourse && (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 mt-2 text-xs overflow-auto max-h-56">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(generatedCourse, null, 2)}
              </pre>
              <Button
                className="w-full mt-1 text-xs"
                variant="outline"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(generatedCourse, null, 2)
                  )
                }
              >
                Copy JSON
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourseDialog;
