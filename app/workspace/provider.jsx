"use client";

import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react'
import AppSidebar from './_components/AppSidebar';
import AppHeader from './_components/AppHeader';
import { usePathname } from 'next/navigation';
function WorkspaceProvider({children}) {
  const pathname = usePathname();
  const hideSidebar = pathname?.startsWith('/workspace/view-course') || false;

  return (
    <div>
      <SidebarProvider>
        {/* Conditionally render the sidebar for routes that need it */}
        {!hideSidebar && <AppSidebar />}
      <div className='w-full'>
        <AppHeader hideSidebar={hideSidebar} />
        <div className='p-10'>
        {children}
        </div>
      </div>
      </SidebarProvider>
    </div>
  )
}

export default WorkspaceProvider;
