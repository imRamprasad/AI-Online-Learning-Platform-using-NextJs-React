"use client";

import React from "react";
import Link from "next/link";
import AddNewCourseDialog from "./AddNewCourseDilog"; // make sure the filename matches
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Cpu,
  CreditCard,
  Settings,
  User,
} from "lucide-react";

const sidebarOptions = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "My Learning", icon: BookOpen, path: "/learning" },
  { title: "Explore Courses", icon: Compass, path: "/courses" },
  { title: "AI Tools", icon: Cpu, path: "/ai-tools" },
  { title: "Billing", icon: CreditCard, path: "/billing" },
  { title: "Profile", icon: User, path: "/profile" },
];

const AppSidebar = () => {
  // This function will be triggered when a new course is added
  const handleAddCourse = (course) => {
    console.log("New Course Added:", course);
    // You can update state or call your API here
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center py-4">
          <Image
            src="/logo.svg"
            alt="App Logo"
            width={100}
            height={40}
            priority
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* 🌈 Dialog wrapped button */}
        <SidebarGroup>
          <AddNewCourseDialog onAddCourse={handleAddCourse}>
            <Button
              className="w-full mt-2 text-white font-semibold
                         bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                         hover:from-purple-600 hover:via-pink-500 hover:to-indigo-500
                         transition-all duration-300 shadow-md"
            >
              Create New Course
            </Button>
          </AddNewCourseDialog>
        </SidebarGroup>

        <SidebarGroup>
          <p className="text-sm font-medium text-gray-600 mt-4 mb-2 px-3">
            Main Menu
          </p>
          <div className="space-y-1">
            {sidebarOptions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="text-base font-medium text-gray-800">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <p className="text-sm font-medium text-gray-600 mt-4 mb-2 px-3">
            Settings
          </p>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Preferences</span>
          </Link>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="text-center text-xs text-gray-500 py-2">
          © 2025 Your App
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
