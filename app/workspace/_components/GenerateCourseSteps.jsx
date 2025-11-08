"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, BookOpen, Video, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

const categories = [
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "personal-development", label: "Personal Development" },
  { value: "photography", label: "Photography" },
  { value: "music", label: "Music" },
  { value: "health", label: "Health & Fitness" },
];

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function GenerateCourseSteps({ setOpen }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "programming",
    level: "beginner",
    numberOfChapters: 5,
    includeVideo: false,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      
      // First generate the course layout
      const layoutResponse = await axios.post("/api/generate-course-layout", formData);
      const courseId = layoutResponse.data.created.cid;

      // Then generate the course content
      await axios.post("/api/generate-course-content", {
        courseId,
        ...formData,
      });

      toast.success("Course generated successfully!");
      router.push(`/workspace/view-course/${courseId}`);
      setOpen?.(false);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error.response?.data?.error || "Failed to generate course");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.description)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (step < 3) setStep(step + 1);
    else handleGenerate();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Course Name</label>
              <Input
                placeholder="e.g., Complete Web Development Bootcamp"
                value={formData.name}
                onChange={({ target: { value } }) => updateField("name", value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="What will students learn in this course?"
                value={formData.description}
                onChange={({ target: { value } }) => updateField("description", value)}
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField("category", value)}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select
                value={formData.level}
                onValueChange={(value) => updateField("level", value)}
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Number of Chapters
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={formData.numberOfChapters}
                onChange={(e) =>
                  updateField("numberOfChapters", parseInt(e.target.value))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 5-10 chapters for a comprehensive course
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium block">
                  Include Video Script
                </label>
                <p className="text-xs text-gray-500">
                  Generate video scripts for each chapter
                </p>
              </div>
              <Switch
                checked={formData.includeVideo}
                onCheckedChange={(checked) =>
                  updateField("includeVideo", checked)
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {[
          { step: 1, icon: BookOpen, label: "Basic Info" },
          { step: 2, icon: Video, label: "Course Details" },
          { step: 3, icon: Sparkles, label: "AI Generation" },
        ].map(({ step: stepNum, icon: Icon, label }) => (
          <div
            key={stepNum}
            className={`flex flex-col items-center ${
              step >= stepNum ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= stepNum
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              AI-Generated Content
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              This feature uses AI to generate course content. Review and edit the
              generated content before publishing.
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || loading}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : step === 3 ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Course
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}