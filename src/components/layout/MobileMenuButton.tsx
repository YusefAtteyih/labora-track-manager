
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
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full glass"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <MenuIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default MobileMenuButton;
