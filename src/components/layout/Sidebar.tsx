
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Beaker, 
  BoxesIcon, 
  Calendar, 
  FileText,
  Home, 
  LogOut, 
  Settings, 
  ShoppingCart,
  Microscope,
  Building,
  Users,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Faculties',
    href: '/faculties',
    icon: Building,
    roles: ['org_admin'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['org_admin'],
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: BoxesIcon,
    roles: ['org_admin'],
  },
  {
    title: 'Labs',
    href: '/labs',
    icon: Microscope,
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: Calendar,
  },
  {
    title: 'Purchases',
    href: '/purchases',
    icon: ShoppingCart,
    roles: ['org_admin', 'lab_supervisor', 'facility_member'],
  },
  {
    title: 'Approvals',
    href: '/approvals',
    icon: CheckSquare,
    roles: ['lab_supervisor'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['org_admin', 'lab_supervisor'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['org_admin'],
  },
];

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-sidebar glass-card md:rounded-none md:glass-card rounded-none md:static md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo and brand */}
        <div className="p-6 flex items-center gap-2">
          <Beaker className="h-8 w-8 text-lab-600" />
          <div>
            <h1 className="text-lg font-semibold leading-none">LabTrack</h1>
            <p className="text-xs text-muted-foreground">Laboratory Management</p>
          </div>
        </div>

        <Separator />

        {/* Faculty info if user is part of one */}
        {user?.faculty && (
          <div className="px-4 py-2">
            <div className="bg-primary/5 rounded-md p-2">
              <p className="text-xs font-medium text-primary">{user.faculty.name}</p>
              <p className="text-xs text-muted-foreground">{user.faculty.department}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Button
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm font-medium h-10",
                    location.pathname === item.href && "bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    navigate(item.href);
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile */}
        {user && (
          <div className="p-4 mt-auto">
            <Separator className="mb-4" />
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
