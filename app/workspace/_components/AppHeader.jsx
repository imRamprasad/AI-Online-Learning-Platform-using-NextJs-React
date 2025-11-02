"use client";

import { UserButton } from "@clerk/nextjs";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

function AppHeader({ hideSidebar = false }) {
  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-md sticky top-0 z-50">
      {/* Left: Sidebar Trigger + App Title */}
      <div className="flex items-center gap-3">
        {!hideSidebar && (
          <SidebarTrigger className="p-2 rounded-md hover:bg-gray-100 transition-all" />
        )}
        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
      </div>

      {/* Right: User profile */}
      <div className="flex items-center gap-4 flex-wrap">
        <button className="px-3 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-all">
          Upgrade
        </button>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox:
                "ring-2 ring-indigo-500 hover:ring-purple-500 transition-all",
            },
          }}
        />
      </div>
    </header>
  );
}

export default AppHeader;
