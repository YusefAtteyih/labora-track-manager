
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Organization {
  id: string;
  name: string;
  description: string;
  university: string;
  faculty: string;
  department: string;
  facilities: number;
  members: number;
  equipment: number;
}

export const useOrganizationsData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const orgChannel = supabase
      .channel('org-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'faculties'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }
      )
      .subscribe();
      
    const userChannel = supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          // Users table changes can affect organization member counts
          queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }
      )
      .subscribe();
      
    const labsChannel = supabase
      .channel('lab-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'labs'
        },
        () => {
          // Labs table changes can affect organization facility counts
          queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orgChannel);
      supabase.removeChannel(userChannel);
      supabase.removeChannel(labsChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['organizations'],
    queryFn: async (): Promise<Organization[]> => {
      // Fetch faculties data (was organizations)
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('id, name, department, university, faculty, description');
        
      if (facultiesError) {
        console.error('Error fetching faculties:', facultiesError);
        throw new Error(facultiesError.message);
      }
      
      // Fetch labs data to get counts by faculty_id
      const { data: labs, error: labsError } = await supabase
        .from('labs')
        .select('faculty_id');
        
      if (labsError) {
        console.error('Error fetching labs for faculties:', labsError);
        throw new Error(labsError.message);
      }
      
      // Count labs by faculty_id
      const labsByFaculty = labs.reduce((acc, lab) => {
        if (lab.faculty_id) {
          acc[lab.faculty_id] = (acc[lab.faculty_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Fetch users count by faculty
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('faculty_id');
        
      if (usersError) {
        console.error('Error fetching users for faculties:', usersError);
        throw new Error(usersError.message);
      }
      
      // Count users by faculty
      const usersByFaculty = users.reduce((acc, user) => {
        if (user.faculty_id) {
          acc[user.faculty_id] = (acc[user.faculty_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Transform the data to match our Organization type
      return facultiesData.map(org => ({
        id: org.id,
        name: org.name,
        description: org.description || `${org.name} - ${org.department} department`,
        university: org.university || 'University of Science and Technology',
        faculty: org.faculty || 'Faculty of Science',
        department: org.department,
        facilities: labsByFaculty[org.id] || 0,
        members: usersByFaculty[org.id] || 0,
        equipment: Math.floor(Math.random() * 50) + 10 // Will keep random for equipment until we have equipment table
      }));
    }
  });
};
