"use client";

import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Target,
  UserCheck,
  Video,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Teachers",
    description:
      "Learn from industry experts who are passionate about teaching and sharing their knowledge.",
  },
  {
    icon: BookOpen,
    title: "Rich Course Content",
    description:
      "Access high-quality course materials, including video lectures, quizzes, and practical exercises.",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description:
      "Follow your own pace with personalized learning paths and progress tracking.",
  },
  {
    icon: Video,
    title: "Interactive Videos",
    description:
      "Engage with interactive video content that makes learning more effective and enjoyable.",
  },
  {
    icon: MessageCircle,
    title: "Community Support",
    description:
      "Join a supportive community of learners and get help whenever you need it.",
  },
  {
    icon: UserCheck,
    title: "Verified Certificates",
    description:
      "Earn recognized certificates upon course completion to showcase your achievements.",
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              succeed
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Our platform provides all the tools and features you need to excel in
            your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border bg-white hover:shadow-lg transition group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}