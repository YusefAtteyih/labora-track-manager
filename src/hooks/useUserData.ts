
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  facultyId?: string;
  faculty?: {
    id: string;
    name: string;
    department: string;
  };
  status?: string;
  lastActive?: string;
}

export const useUserData = () => {
  const queryClient = useQueryClient();
  const { session, isAuthenticated } = useAuth();

  // Set up real-time subscription
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, isAuthenticated]);

  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      try {
        console.log('Fetching users data, auth state:', isAuthenticated);
        
        // Check if authenticated
        if (!isAuthenticated || !session) {
          console.warn('No active session, returning empty users array');
          return [];
        }
        
        // Fetch users from the database with their faculty details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            role,
            avatar,
            faculty_id,
            status,
            last_active,
            faculties:faculty_id (
              id,
              name,
              department
            )
          `)
          .order('name');
        
        if (userError) {
          console.error('Error fetching users:', userError);
          throw new Error(userError.message);
        }
        
        console.log('Users data received:', userData);
        
        if (!userData || userData.length === 0) {
          console.warn('No user data returned from query');
          return [];
        }
        
        // Transform the data to match our User type
        return userData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          avatar: user.avatar,
          facultyId: user.faculty_id || undefined,
          faculty: user.faculties ? {
            id: user.faculties.id,
            name: user.faculties.name,
            department: user.faculties.department
          } : undefined,
          status: user.status,
          lastActive: user.last_active
        }));
      } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && !!session,
    retry: 1,
    refetchOnWindowFocus: false
  });
};
