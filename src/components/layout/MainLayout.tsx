
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  // On mobile, start with sidebar closed
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Update sidebar state when screen size changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile menu button */}
      <MobileMenuButton sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar - with improved mobile handling */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content - with improved responsive spacing */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "pt-16 md:pt-0 md:ml-0 min-h-screen max-w-full",
        sidebarOpen ? "md:pl-64" : "md:pl-0"
      )}>
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-6 animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
