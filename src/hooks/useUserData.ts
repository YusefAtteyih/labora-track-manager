
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/context/AuthContext';
import { useEffect } from 'react';

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

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
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
  }, [queryClient]);

  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
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
    }
  });
};
