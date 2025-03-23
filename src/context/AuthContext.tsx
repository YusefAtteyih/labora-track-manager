
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

// Define user roles with the new hierarchy
export type UserRole = 'org_admin' | 'lab_supervisor' | 'facility_member' | 'student' | 'visitor';

// Define faculty type with the new structure
export interface Faculty {
  id: string;
  name: string;
  university: string;
  faculty: string;
  department: string;
  description?: string;
  parentId?: string;
}

// Define user type with faculty
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  facultyId?: string;
  faculty?: Faculty;
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
        console.log('Session found, fetching user data');
        
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            id, 
            name, 
            email, 
            role, 
            avatar, 
            faculty_id,
            faculties:faculty_id (
              id, 
              name, 
              university,
              faculty,
              department,
              description,
              parent_id
            )
          `)
          .eq('id', session.user.id);
        
        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }
        
        if (userData && userData.length > 0) {
          console.log('User data received:', userData[0]);
          
          const authUser: User = {
            id: userData[0].id,
            name: userData[0].name,
            email: userData[0].email,
            role: userData[0].role as UserRole,
            avatar: userData[0].avatar,
            facultyId: userData[0].faculty_id,
            faculty: userData[0].faculties ? {
              id: userData[0].faculties.id,
              name: userData[0].faculties.name,
              university: userData[0].faculties.university || 'University of Science and Technology',
              faculty: userData[0].faculties.faculty || 'Faculty of Science',
              department: userData[0].faculties.department,
              description: userData[0].faculties.description,
              parentId: userData[0].faculties.parent_id
            } : undefined
          };
          
          setUser(authUser);
          toast({
            title: "Authenticated",
            description: `Welcome back, ${authUser.name}`,
          });
        } else {
          console.warn('No user data found for this authenticated session');
          logout(); // Automatically log out if user data is missing
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
            faculty_id,
            faculties:faculty_id (
              id, 
              name, 
              university,
              faculty,
              department,
              description,
              parent_id
            )
          `)
          .eq('id', data.user.id);
          
        if (userError) {
          console.error('Error fetching user data after login:', userError);
          toast({
            title: "Error",
            description: "Could not fetch user profile",
            variant: "destructive",
          });
          throw userError;
        }
        
        if (userData && userData.length > 0) {
          const authUser: User = {
            id: userData[0].id,
            name: userData[0].name,
            email: userData[0].email,
            role: userData[0].role as UserRole,
            avatar: userData[0].avatar,
            facultyId: userData[0].faculty_id,
            faculty: userData[0].faculties ? {
              id: userData[0].faculties.id,
              name: userData[0].faculties.name,
              university: userData[0].faculties.university || 'University of Science and Technology',
              faculty: userData[0].faculties.faculty || 'Faculty of Science',
              department: userData[0].faculties.department,
              description: userData[0].faculties.description,
              parentId: userData[0].faculties.parent_id
            } : undefined
          };
          
          setUser(authUser);
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${authUser.name}!`,
          });
        } else {
          console.error('No user data found after login');
          toast({
            title: "Login issue",
            description: "User profile not found. Please contact support.",
            variant: "destructive",
          });
        }
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
        console.log('User signed up with auth, creating profile in DB');
        
        // Manually create user record to ensure it exists (in case trigger fails)
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: data.user.id,
              name: name, 
              email: data.user.email,
              role: role,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=fff`
            }
          ]);

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          toast({
            title: "Profile creation failed",
            description: insertError.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration successful",
            description: `Welcome, ${name}!`,
          });
          
          // Set the user state directly with the data we have
          const authUser: User = {
            id: data.user.id,
            name: name,
            email: data.user.email || '',
            role: role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=fff`
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
    console.log('Auth provider mounted, checking auth');
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
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
