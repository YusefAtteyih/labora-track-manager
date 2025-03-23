
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async (): Promise<Organization[]> => {
      // In a real application, we would fetch this from a organizations table
      // Since we don't have that table yet, we're using mock data
      // but structuring the code to easily switch to real data later
      
      console.warn('Using mock organizations data - create an organizations table for real data');
      
      // Fetch facilities data to show real counts by department
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
      
      // Mock organizations with real facility counts where possible
      const mockOrganizations = [
        {
          id: '1',
          name: 'Science Department',
          description: 'Chemistry and biology research labs',
          department: 'Chemistry',
          facilities: facilitiesByDept['Chemistry'] || 3,
          members: 15,
          equipment: 48
        },
        {
          id: '2',
          name: 'Engineering Department',
          description: 'Computer science and electrical engineering labs',
          department: 'Computer Science',
          facilities: facilitiesByDept['Computer Science'] || 2,
          members: 12,
          equipment: 36
        },
        {
          id: '3',
          name: 'Medical Department',
          description: 'Medical research and training facilities',
          department: 'Biology',
          facilities: facilitiesByDept['Biology'] || 4,
          members: 20,
          equipment: 62
        }
      ];
      
      return mockOrganizations;
    }
  });
};
