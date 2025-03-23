
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <MobileMenuButton sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "md:ml-0 min-h-screen max-w-full",
        sidebarOpen ? "md:pl-64" : "md:pl-0"
      )}>
        <div className="container mx-auto px-4 py-6 animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
