
import React from 'react';
import { MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuButtonProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <div className="md:hidden fixed top-4 left-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full bg-background shadow-md border-sidebar-border"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MenuIcon className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default MobileMenuButton;
