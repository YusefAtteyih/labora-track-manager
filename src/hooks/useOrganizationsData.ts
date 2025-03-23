
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Organization {
  id: string;
  name: string;
  description: string;
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
          table: 'organizations'
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

    return () => {
      supabase.removeChannel(orgChannel);
      supabase.removeChannel(userChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['organizations'],
    queryFn: async (): Promise<Organization[]> => {
      // Fetch organizations data
      const { data: organizationsData, error: organizationsError } = await supabase
        .from('organizations')
        .select('id, name, department');
        
      if (organizationsError) {
        console.error('Error fetching organizations:', organizationsError);
        throw new Error(organizationsError.message);
      }
      
      // Fetch facilities data to get real counts by department
      const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('department');
        
      if (facilitiesError) {
        console.error('Error fetching facilities for organizations:', facilitiesError);
        throw new Error(facilitiesError.message);
      }
      
      // Count facilities by department
      const facilitiesByDept = facilities.reduce((acc, facility) => {
        if (facility.department) {
          acc[facility.department] = (acc[facility.department] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Fetch users count by organization
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('organization_id');
        
      if (usersError) {
        console.error('Error fetching users for organizations:', usersError);
        throw new Error(usersError.message);
      }
      
      // Count users by organization
      const usersByOrg = users.reduce((acc, user) => {
        if (user.organization_id) {
          acc[user.organization_id] = (acc[user.organization_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Transform the data to match our Organization type
      return organizationsData.map(org => ({
        id: org.id,
        name: org.name,
        description: `${org.name} - ${org.department} department`,
        department: org.department,
        facilities: facilitiesByDept[org.department] || 0,
        members: usersByOrg[org.id] || 0,
        equipment: Math.floor(Math.random() * 50) + 10 // Will keep random for equipment until we have equipment table
      }));
    }
  });
};
