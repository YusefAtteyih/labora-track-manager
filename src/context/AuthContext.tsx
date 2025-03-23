
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

// Define user roles with the new hierarchy
export type UserRole = 'org_admin' | 'lab_supervisor' | 'facility_member' | 'student' | 'visitor';

// Define organization type
export interface Organization {
  id: string;
  name: string;
  department: string;
}

// Define user type with organization
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organizationId?: string;
  organization?: Organization;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Mock organizations
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: '1',
    name: 'Science Department',
    department: 'Chemistry'
  },
  {
    id: '2',
    name: 'Engineering Department',
    department: 'Computer Science'
  },
  {
    id: '3',
    name: 'Medical Department',
    department: 'Biology'
  }
];

// Mock users with the new hierarchy
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Organization Admin',
    email: 'org_admin@university.edu',
    role: 'org_admin',
    avatar: 'https://ui-avatars.com/api/?name=Org+Admin&background=0284c7&color=fff',
    organizationId: '1',
    organization: MOCK_ORGANIZATIONS[0]
  },
  {
    id: '2',
    name: 'Lab Supervisor',
    email: 'lab_supervisor@university.edu',
    role: 'lab_supervisor',
    avatar: 'https://ui-avatars.com/api/?name=Lab+Supervisor&background=0ea5e9&color=fff',
    organizationId: '1',
    organization: MOCK_ORGANIZATIONS[0]
  },
  {
    id: '3',
    name: 'Facility Member',
    email: 'facility_member@university.edu',
    role: 'facility_member',
    avatar: 'https://ui-avatars.com/api/?name=Facility+Member&background=38bdf8&color=fff',
    organizationId: '1',
    organization: MOCK_ORGANIZATIONS[0]
  },
  {
    id: '4',
    name: 'Student User',
    email: 'student@university.edu',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Student+User&background=7dd3fc&color=fff',
    organizationId: '2',
    organization: MOCK_ORGANIZATIONS[1]
  },
  {
    id: '5',
    name: 'Visitor User',
    email: 'visitor@example.com',
    role: 'visitor',
    avatar: 'https://ui-avatars.com/api/?name=Visitor+User&background=bae6fd&color=fff'
  }
];

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  const checkAuth = () => {
    setIsLoading(true);
    const storedUser = localStorage.getItem('labUser');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      toast({
        title: "Authenticated",
        description: "Welcome back to the Laboratory Management System",
      });
    }
    
    setIsLoading(false);
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user with matching email
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    if (foundUser) {
      // In a real app, we would validate the password here
      setUser(foundUser);
      localStorage.setItem('labUser', JSON.stringify(foundUser));
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if email is already in use
    if (MOCK_USERS.some(u => u.email === email)) {
      toast({
        title: "Registration failed",
        description: "Email is already in use",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Create new user
    const newUser: User = {
      id: `${MOCK_USERS.length + 1}`,
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`
    };
    
    // In a real app, we would save the user to the database
    
    setUser(newUser);
    localStorage.setItem('labUser', JSON.stringify(newUser));
    
    toast({
      title: "Registration successful",
      description: `Welcome, ${newUser.name}!`,
    });
    
    setIsLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('labUser');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Create context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
