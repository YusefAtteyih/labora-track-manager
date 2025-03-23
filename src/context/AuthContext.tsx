
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

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

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            id, 
            name, 
            email, 
            role, 
            avatar, 
            organization_id,
            organizations:organization_id (
              id, 
              name, 
              department
            )
          `)
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }
        
        if (userData) {
          const authUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as UserRole,
            avatar: userData.avatar,
            organizationId: userData.organization_id,
            organization: userData.organizations ? {
              id: userData.organizations.id,
              name: userData.organizations.name,
              department: userData.organizations.department
            } : undefined
          };
          
          setUser(authUser);
          toast({
            title: "Authenticated",
            description: `Welcome back, ${authUser.name}`,
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (data.user) {
        // Fetch user's additional data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id, 
            name, 
            email, 
            role, 
            avatar, 
            organization_id,
            organizations:organization_id (
              id, 
              name, 
              department
            )
          `)
          .eq('id', data.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user data after login:', userError);
          toast({
            title: "Error",
            description: "Could not fetch user profile",
            variant: "destructive",
          });
          throw userError;
        }
        
        const authUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          avatar: userData.avatar,
          organizationId: userData.organization_id,
          organization: userData.organizations ? {
            id: userData.organizations.id,
            name: userData.organizations.name,
            department: userData.organizations.department
          } : undefined
        };
        
        setUser(authUser);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${authUser.name}!`,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      // User signup with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (data.user) {
        // The trigger created on auth.users will automatically create a user in our users table
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`,
        });
        
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch the new user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id, 
            name, 
            email, 
            role, 
            avatar, 
            organization_id,
            organizations:organization_id (
              id, 
              name, 
              department
            )
          `)
          .eq('id', data.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching new user data:', userError);
        } else {
          const authUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as UserRole,
            avatar: userData.avatar,
            organizationId: userData.organization_id,
            organization: userData.organizations ? {
              id: userData.organizations.id,
              name: userData.organizations.name,
              department: userData.organizations.department
            } : undefined
          };
          
          setUser(authUser);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
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
