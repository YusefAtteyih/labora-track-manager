
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Faculty {
  id: string;
  name: string;
  description: string;
  university: string;
  faculty: string;
  department: string;
  facilities: number;
  members: number;
  equipment: number;
  parentId?: string;
}

export const useFacultiesData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const facultyChannel = supabase
      .channel('faculty-changes')
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
          // Users table changes can affect faculty member counts
          queryClient.invalidateQueries({ queryKey: ['faculties'] });
        }
      )
      .subscribe();
      
    const facilityChannel = supabase
      .channel('facility-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facilities'
        },
        () => {
          // Facility table changes can affect faculty facility counts
          queryClient.invalidateQueries({ queryKey: ['faculties'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(facultyChannel);
      supabase.removeChannel(userChannel);
      supabase.removeChannel(facilityChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['faculties'],
    queryFn: async (): Promise<Faculty[]> => {
      // Fetch faculties data
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('id, name, department, university, faculty, description, parent_id');
        
      if (facultiesError) {
        console.error('Error fetching faculties:', facultiesError);
        throw new Error(facultiesError.message);
      }
      
      // Fetch facilities data to get real counts by department
      const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('department');
        
      if (facilitiesError) {
        console.error('Error fetching facilities for faculties:', facilitiesError);
        throw new Error(facilitiesError.message);
      }
      
      // Count facilities by department
      const facilitiesByDept = facilities.reduce((acc, facility) => {
        if (facility.department) {
          acc[facility.department] = (acc[facility.department] || 0) + 1;
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
      
      // Transform the data to match our Faculty type
      return facultiesData.map(faculty => ({
        id: faculty.id,
        name: faculty.name,
        description: faculty.description || `${faculty.name} - ${faculty.department} department`,
        university: faculty.university || 'University of Science and Technology',
        faculty: faculty.faculty || 'Faculty of Science',
        department: faculty.department,
        facilities: facilitiesByDept[faculty.department] || 0,
        members: usersByFaculty[faculty.id] || 0,
        equipment: Math.floor(Math.random() * 50) + 10, // Will keep random for equipment until we have equipment table
        parentId: faculty.parent_id
      }));
    }
  });
};
