"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  BookOpen,
  FileText,
  Brain,
  Target,
  Zap,
  ArrowRight,
  Cpu
} from 'lucide-react';

const AIToolsPage = () => {
  const aiTools = [
    {
      id: 'course-generator',
      title: 'Course Generator',
      description: 'Create comprehensive courses with AI assistance. Generate course outlines, chapters, and learning objectives automatically.',
      icon: BookOpen,
      path: '/workspace',
      color: 'from-blue-500 to-blue-700',
      features: ['AI-powered outlines', 'Chapter generation', 'Learning objectives']
    },
    {
      id: 'content-creator',
      title: 'Content Creator',
      description: 'Generate engaging course content including videos, quizzes, and interactive materials using advanced AI.',
      icon: FileText,
      path: '/workspace',
      color: 'from-green-500 to-green-700',
      features: ['Video scripts', 'Quiz generation', 'Interactive content']
    },
    {
      id: 'study-planner',
      title: 'Study Planner',
      description: 'AI-driven personalized study plans that adapt to your learning pace and goals.',
      icon: Target,
      path: '/learning',
      color: 'from-purple-500 to-purple-700',
      features: ['Personalized schedules', 'Progress tracking', 'Adaptive learning']
    },
    {
      id: 'smart-quiz',
      title: 'Smart Quiz Builder',
      description: 'Create intelligent quizzes with adaptive difficulty and instant feedback using AI analysis.',
      icon: Brain,
      path: '/workspace',
      color: 'from-orange-500 to-orange-700',
      features: ['Adaptive difficulty', 'Instant feedback', 'Performance analytics']
    },
    {
      id: 'content-summarizer',
      title: 'Content Summarizer',
      description: 'Automatically summarize long course materials and generate key takeaways for quick review.',
      icon: Zap,
      path: '/workspace',
      color: 'from-red-500 to-red-700',
      features: ['Quick summaries', 'Key takeaways', 'Review materials']
    },
    {
      id: 'learning-assistant',
      title: 'AI Learning Assistant',
      description: 'Get instant help with course concepts, explanations, and personalized learning recommendations.',
      icon: Sparkles,
      path: '/workspace',
      color: 'from-indigo-500 to-indigo-700',
      features: ['Concept explanations', 'Personalized help', 'Learning recommendations']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Cpu className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI Tools</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Harness the power of artificial intelligence to enhance your learning experience.
            Create, customize, and optimize your courses with our suite of AI-powered tools.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{tool.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {tool.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Link href={tool.path}>
                      <Button className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white`}>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Start using our AI tools today to create engaging courses, generate content,
                and provide personalized learning experiences for your students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/workspace">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Creating
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our AI Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate course content and materials in seconds, not hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized</h3>
              <p className="text-gray-600">
                AI adapts to your teaching style and student needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent</h3>
              <p className="text-gray-600">
                Advanced algorithms ensure high-quality, engaging content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsPage;
