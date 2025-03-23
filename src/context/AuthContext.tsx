
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('Checking auth state...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }
      
      if (session) {
        console.log('Session found, fetching user data for ID:', session.user.id);
        
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
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }
        
        if (userData) {
          console.log('User data received:', userData);
          
          const authUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as UserRole,
            avatar: userData.avatar,
            facultyId: userData.faculty_id,
            faculty: userData.faculties ? {
              id: userData.faculties.id,
              name: userData.faculties.name,
              university: userData.faculties.university || 'University of Science and Technology',
              faculty: userData.faculties.faculty || 'Faculty of Science',
              department: userData.faculties.department,
              description: userData.faculties.description,
              parentId: userData.faculties.parent_id
            } : undefined
          };
          
          setUser(authUser);
          toast({
            title: "Authenticated",
            description: `Welcome back, ${authUser.name}`,
          });
        } else {
          console.warn('No user data found for this authenticated session', session.user.id);
          // Check if we need to create a user record
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser?.user) {
            console.log('Found auth user but no profile record, attempting to create one');
            await createUserRecord(authUser.user.id, authUser.user.email || '', 'org_admin');
            // Try fetching again after creating
            checkAuth();
          } else {
            logout(); // Automatically log out if user data is missing
          }
        }
      } else {
        console.log('No active session found');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create a user record if missing
  const createUserRecord = async (userId: string, email: string, role: UserRole) => {
    try {
      const name = email.split('@')[0];
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
        console.error('Error creating user record:', error);
        throw error;
      }
      console.log('User record created successfully');
    } catch (error) {
      console.error('Error in createUserRecord:', error);
      throw error;
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
        console.error('Login error from Supabase:', error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        console.log('Login successful, fetching user data for ID:', data.user.id);
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
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (userError) {
          console.error('Error fetching user data after login:', userError);
          toast({
            title: "Error",
            description: "Could not fetch user profile",
            variant: "destructive",
          });
          return false;
        }
        
        if (userData) {
          console.log('User profile found:', userData);
          const authUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as UserRole,
            avatar: userData.avatar,
            facultyId: userData.faculty_id,
            faculty: userData.faculties ? {
              id: userData.faculties.id,
              name: userData.faculties.name,
              university: userData.faculties.university || 'University of Science and Technology',
              faculty: userData.faculties.faculty || 'Faculty of Science',
              department: userData.faculties.department,
              description: userData.faculties.description,
              parentId: userData.faculties.parent_id
            } : undefined
          };
          
          setUser(authUser);
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${authUser.name}!`,
          });
          
          return true;
        } else {
          console.warn('No user profile found, attempting to create one');
          try {
            await createUserRecord(data.user.id, data.user.email || '', 'org_admin');
            // Try fetching again after creating
            const result = await login(email, password);
            return result;
          } catch (createError) {
            console.error('Failed to create user profile:', createError);
            toast({
              title: "Login issue",
              description: "User profile not found and couldn't be created. Please contact support.",
              variant: "destructive",
            });
            return false;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
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
        console.error('Registration error from Supabase:', error);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        console.log('User signed up with auth ID:', data.user.id, 'creating profile in DB');
        
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
          return false;
        } else {
          console.log('User profile created successfully');
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
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
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
