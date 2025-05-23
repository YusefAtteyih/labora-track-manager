
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface Faculty {
  id: string;
  name: string;
  university: string;
  faculty: string;
  department: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  // These properties are used in Faculties.tsx
  members: number;
  facilities: number;
  equipment: number;
}

export const useFacultiesData = () => {
  const queryClient = useQueryClient();
  const { session, isAuthenticated } = useAuth();

  // Set up real-time subscription
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = supabase
      .channel('faculties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'faculties'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['faculties'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, isAuthenticated]);

  return useQuery({
    queryKey: ['faculties'],
    queryFn: async (): Promise<Faculty[]> => {
      try {
        console.log('Fetching faculties data, auth state:', isAuthenticated);
        
        // Check if authenticated
        if (!isAuthenticated || !session) {
          console.warn('No active session, returning empty faculties array');
          return [];
        }
        
        // Fetch faculties from database
        const { data, error } = await supabase
          .from('faculties')
          .select(`
            id,
            name,
            university,
            faculty,
            department,
            description,
            parent_id,
            created_at
          `)
          .order('name');
        
        if (error) {
          console.error('Error fetching faculties:', error);
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          console.log('No faculties data returned from query');
          return [];
        }
        
        console.log('Faculties data received:', data.length);
        
        // Transform the data to match our Faculty type
        return data.map(faculty => ({
          id: faculty.id,
          name: faculty.name,
          university: faculty.university || 'University of Science and Technology',
          faculty: faculty.faculty || 'Faculty of Science',
          department: faculty.department,
          description: faculty.description || '',
          parentId: faculty.parent_id,
          createdAt: faculty.created_at,
          // Add actual values if available, otherwise use placeholders
          members: Math.floor(Math.random() * 50) + 5, // Placeholder with random data
          facilities: Math.floor(Math.random() * 10) + 1, // Placeholder with random data
          equipment: Math.floor(Math.random() * 30) + 10, // Placeholder with random data
        }));
      } catch (error) {
        console.error('Failed to fetch faculties:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && !!session,
    retry: 1,
    refetchOnWindowFocus: false
  });
};
