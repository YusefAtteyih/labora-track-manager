
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Define user roles
export type UserRole = 'org_admin' | 'lab_supervisor' | 'facility_member' | 'student' | 'visitor';

// Define faculty type
export interface Faculty {
  id: string;
  name: string;
  university: string;
  faculty: string;
  department: string;
  description?: string;
  parentId?: string;
}

// Define user type
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
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
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
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (!data) {
        console.warn('No user profile found for ID:', userId);
        return null;
      }
      
      // Transform to User object
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        avatar: data.avatar,
        facultyId: data.faculty_id,
        faculty: data.faculties ? {
          id: data.faculties.id,
          name: data.faculties.name,
          university: data.faculties.university || 'University of Science and Technology',
          faculty: data.faculties.faculty || 'Faculty of Science',
          department: data.faculties.department,
          description: data.faculties.description,
          parentId: data.faculties.parent_id
        } : undefined
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Create user profile if it doesn't exist
  const createUserProfile = async (userId: string, email: string, name: string, role: UserRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([{ 
          id: userId,
          name: name, 
          email: email,
          role: role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=fff`
        }]);
        
      if (error) {
        console.error('Error creating user profile:', error);
        return false;
      }
      
      console.log('User profile created successfully');
      return true;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return false;
    }
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('Checking auth state...');
      // Get current session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return;
      }
      
      // Store session
      setSession(data.session);
      
      // If no session, user is not authenticated
      if (!data.session) {
        console.log('No active session found');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Get user profile
      const userProfile = await fetchUserProfile(data.session.user.id);
      
      if (userProfile) {
        // User profile exists
        setUser(userProfile);
        toast({
          title: "Authenticated",
          description: `Welcome back, ${userProfile.name}`,
        });
      } else {
        // Try to create user profile if it doesn't exist
        const authUser = await supabase.auth.getUser();
        if (authUser.data?.user) {
          console.log('Creating missing user profile');
          const name = authUser.data.user.email?.split('@')[0] || 'User';
          const success = await createUserProfile(
            authUser.data.user.id,
            authUser.data.user.email || '',
            name,
            'student'
          );
          
          if (success) {
            // Fetch the newly created profile
            const newProfile = await fetchUserProfile(authUser.data.user.id);
            if (newProfile) {
              setUser(newProfile);
            } else {
              await logout();
            }
          } else {
            await logout();
          }
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Store session
      setSession(data.session);
      
      // Get user profile
      const userProfile = await fetchUserProfile(data.user.id);
      
      if (userProfile) {
        // User profile exists
        setUser(userProfile);
        toast({
          title: "Login successful",
          description: `Welcome back, ${userProfile.name}!`,
        });
        return true;
      } else {
        // Create user profile if it doesn't exist
        console.log('Creating missing user profile after login');
        const name = email.split('@')[0];
        const success = await createUserProfile(
          data.user.id,
          email,
          name,
          'student'
        );
        
        if (success) {
          // Fetch the newly created profile
          const newProfile = await fetchUserProfile(data.user.id);
          if (newProfile) {
            setUser(newProfile);
            toast({
              title: "Login successful",
              description: `Welcome, ${newProfile.name}!`,
            });
            return true;
          }
        }
        
        // If we reach here, something went wrong
        toast({
          title: "Login issue",
          description: "Could not retrieve user profile.",
          variant: "destructive",
        });
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Registering new user:', email, 'with role:', role);
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
        console.error('Registration error:', error);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Store session
      setSession(data.session);
      
      if (!data.user) {
        toast({
          title: "Registration failed",
          description: "Could not create user account",
          variant: "destructive",
        });
        return false;
      }
      
      // Create user profile
      const success = await createUserProfile(
        data.user.id,
        email,
        name,
        role
      );
      
      if (success) {
        // Set user state
        const userProfile: User = {
          id: data.user.id,
          name: name,
          email: email,
          role: role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=fff`
        };
        
        setUser(userProfile);
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Registration issue",
          description: "Account created but profile setup failed",
          variant: "destructive",
        });
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Return true to indicate successful logout
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
      
      // Return false to indicate failed logout
      return false;
    }
  };

  // Set up auth state listener on component mount
  useEffect(() => {
    console.log('Auth provider mounted, checking auth');
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );
    
    // Check initial auth state
    checkAuth();
    
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Create context value
  const value: AuthContextType = {
    user,
    session,
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
