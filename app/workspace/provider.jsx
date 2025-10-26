import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Sidebar } from 'lucide-react';
import React from 'react'
import AppSidebar from './_components/AppSidebar';
import AppHeader from './_components/AppHeader';
function WorkspaceProvider({children}) {
  return (
    <div>
      <SidebarProvider>
        {/* <SidebarTrigger/> */}
        <AppSidebar />
      <div className='w-full'>
        <AppHeader/>
        <div className='p-10'>
        {children}
        </div>
      </div>
      </SidebarProvider>
    </div>
  )
}

export default WorkspaceProvider;
